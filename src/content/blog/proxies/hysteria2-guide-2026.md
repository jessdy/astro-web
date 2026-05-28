---
title: Hysteria2 协议实战指南：2026 年最快的翻墙方案
description: 详解 Hysteria2 协议原理、Brutal 拥塞控制、服务端部署、全平台客户端配置，以及与其他协议的对比实测
duration: 8min
date: 2026-05-29
tags: [Hysteria2, 代理, QUIC, 翻墙, 协议, 科学上网]
---

## 为什么你需要关注 Hysteria2

在 2026 年的今天，翻墙协议的选择比以往任何时候都多。但如果你追求的是**极致速度**和**强抗封锁能力**，Hysteria2 几乎是不二之选。

Hysteria2 是 Hysteria 协议的第 2 个大版本，由一群熟悉 GFW 工作机制的开发者从头重写。它基于 **QUIC 协议**（HTTP/3 的底层传输协议），专为高延迟、高丢包的网络环境设计。简单说：**同样的线路，Hysteria2 能跑出其他协议 2-5 倍的吞吐量**。

## Hysteria2 快在哪里？

### 1. QUIC 的先天优势

QUIC 相比 TCP 有三个关键优势：

- **0-RTT 握手**：首次连接只需 1 个 RTT，后续重连可以做到 0-RTT。TCP+TLS 需要 2-3 个 RTT
- **无队头阻塞**：QUIC 的多路复用是真正独立的流，一个流丢包不影响其他流。TCP 一旦丢包，所有流都被阻塞
- **连接迁移**：切换网络（WiFi → 4G）时 QUIC 连接不会断开，TCP 必须重建

### 2. Brutal 拥塞控制算法

这是 Hysteria2 的杀手锏。传统的拥塞控制算法（BBR、CUBIC）在丢包时会主动降速，而 Brutal 采用了完全不同的思路：

> **Brutal 会以用户指定的速率持续发送数据，无视丢包。它用 FEC（前向纠错）和重传来保证数据完整性，而不是靠降速来"避免"丢包。**

在高丢包网络（比如跨境链路），这个策略非常有效。实测中，一条 100Mbps 的 VPS 线路，用 BBR 的 TCP 协议只能跑到 20-30Mbps，而 Hysteria2 + Brutal 可以跑满 100Mbps。

```yaml
# Brutal 关键配置
bandwidth:
  up: 100 mbps    # 上行带宽（VPS 上传给客户端）
  down: 100 mbps  # 下行带宽（客户端上传给 VPS）
```

### 3. Port Hopping（端口跳跃）

这是 Hysteria2 对抗端口封锁的利器。你可以配置一个端口范围，服务端会按固定间隔切换监听端口：

```yaml
# 服务端配置端口跳跃
listen: :443
portHopping:
  ports: "20000-50000"
  interval: 60s   # 每 60 秒切换一次
```

客户端会与服务端同步跳跃，GFW 几乎无法跟踪和封锁。即使封掉当前端口，下一秒流量已经在另一个端口上跑了。

## 服务端部署：三步搞定

### 前提条件

- 一台境外 VPS（建议 Ubuntu 22.04+）
- 已放行防火墙端口（UDP）

### 步骤一：安装 Hysteria2

```bash
# 官方一键安装脚本
bash <(curl -fsSL https://get.hy2.sh/)

# 或者手动下载二进制
wget https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64
chmod +x hysteria-linux-amd64
mv hysteria-linux-amd64 /usr/local/bin/hysteria
```

### 步骤二：编写服务端配置

创建 `/etc/hysteria/config.yaml`：

```yaml
listen: :443

# 使用自签名证书
tls:
  cert: /etc/hysteria/cert.crt
  key: /etc/hysteria/private.key
  
# 认证
auth:
  type: password
  password: your-strong-password-here

# 带宽限制（根据你的 VPS 配置）
bandwidth:
  up: 200 mbps
  down: 200 mbps

# 端口跳跃（可选但强烈推荐）
portHopping:
  ports: "20000-50000"
  interval: 60s

# 伪装设置
masquerade:
  type: proxy
  proxy:
    url: https://www.bing.com/
    rewriteHost: true

# QUIC 参数
quic:
  initStreamReceiveWindow: 8388608
  maxStreamReceiveWindow: 8388608
  initConnReceiveWindow: 20971520
  maxConnReceiveWindow: 20971520
  maxIdleTimeout: 30s
  keepAliveInterval: 10s

# ACL（可选路由规则）
acl:
  inline:
    - direct(all)
```

生成自签名证书：

```bash
mkdir -p /etc/hysteria
openssl req -x509 -nodes -newkey ec:<(openssl ecparam -name prime256v1) \
  -keyout /etc/hysteria/private.key \
  -out /etc/hysteria/cert.crt \
  -days 3650 -subj "/CN=bing.com"
```

### 步骤三：启动服务

```bash
# 前台测试运行
hysteria server -c /etc/hysteria/config.yaml

# 使用 systemd 管理
cat > /etc/systemd/system/hysteria-server.service << 'EOF'
[Unit]
Description=Hysteria2 Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/hysteria server -c /etc/hysteria/config.yaml
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now hysteria-server
systemctl status hysteria-server
```

## 客户端配置：全平台覆盖

### 生成客户端配置

最简单的办法是用 Hysteria2 内置命令生成分享链接：

```bash
hysteria share -c /etc/hysteria/config.yaml
```

输出类似：`hysteria2://your-password@your-server-ip:443?insecure=1&sni=bing.com#MyServer`

### iOS：Shadowrocket / Stash

1. 复制 `hysteria2://` 链接
2. 打开 Shadowrocket，点击右上角「+」
3. 选择「类型」→「Hysteria2」，粘贴链接
4. 在 `allowInsecure` 设置为 `true`

### Android：v2rayNG / NekoBox

v2rayNG 从 1.8.5 版本开始原生支持 Hysteria2：

1. 点击「+」→「手动输入」
2. 类型选择「Hysteria2」
3. 填入服务器地址、端口、密码
4. `insecure` 设为 `true`

NekoBox 配置路径：`服务器` → `新建服务器` → 选择 `Hysteria2`。

### Windows：v2rayN / NekoRay

v2rayN 6.x 版本直接支持：

1. 服务器 → 添加服务器 → 选择 `hysteria2`
2. 填入配置参数
3. 右键节点 → 「设为活动服务器」

### macOS：Clash Verge Rev / sing-box

```yaml
# Clash Verge 配置片段
proxies:
  - name: "Hysteria2-Node"
    type: hysteria2
    server: your-server-ip
    port: 443
    password: your-password
    sni: bing.com
    skip-cert-verify: true
```

### Linux / 路由器：命令行

```bash
# 直接运行客户端
hysteria client -c client.yaml
```

客户端 `client.yaml`：

```yaml
server: your-server-ip:443
auth: your-password

tls:
  sni: bing.com
  insecure: true

bandwidth:
  up: 50 mbps
  down: 200 mbps

# SOCKS5 代理
socks5:
  listen: 127.0.0.1:1080

# HTTP 代理
http:
  listen: 127.0.0.1:8080
```

## 性能调优：让你的线路飞起来

### QUIC 接收窗口

默认的 QUIC 窗口在高带宽场景下会成为瓶颈：

```yaml
quic:
  initStreamReceiveWindow: 16777216    # 16MB
  maxStreamReceiveWindow: 16777216     # 16MB
  initConnReceiveWindow: 33554432      # 32MB
  maxConnReceiveWindow: 33554432       # 32MB
```

### Brutal 带宽设置

**关键原则**：`bandwidth` 的值应该**略低于**你的实际可用带宽。

- 太高 → 持续丢包 + 大量重传 → 浪费流量
- 太低 → 带宽利用不充分

建议先用 `iperf3` 测出你的跨境带宽，然后设置 `bandwidth` 为测量值的 80-90%。

### UDP 被封怎么办？

在某些网络环境下，UDP 443 端口可能被 QoS 限速甚至完全阻断。Hysteria2 的应对：

1. **端口跳跃** — 同时监听多个端口
2. **TCP 伪装模式** — 使用 `masquerade` 将流量伪装成 HTTPS
3. **更换端口** — 尝试非标准端口如 8443、2053、2083

## 协议对比：Hysteria2 vs 其他方案

| 特性 | Hysteria2 | VLESS+Reality | Sing-Box | WireGuard |
|------|----------|---------------|----------|-----------|
| 传输协议 | QUIC (UDP) | TCP + TLS | 多协议 | UDP |
| 速度（高丢包） | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 抗封锁 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 配置难度 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 客户端生态 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 资源占用 | 低 | 中 | 中 | 极低 |

### 什么时候选 Hysteria2？

- ✅ 你的线路质量一般，需要榨干每一滴带宽
- ✅ 你需要端口跳跃对抗封锁
- ✅ 你追求极致速度
- ✅ 你有流媒体解锁、大文件下载需求

### 什么时候不选？

- ❌ 你的网络环境 UDP 被严格限制（企业网、校园网）
- ❌ 你需要最强的隐蔽性 → 选 VLESS+Reality
- ❌ 你需要 TUN 模式全局代理 → 搭配 sing-box 使用

## 常见坑与排错

### 1. 连接超时

```bash
# 检查 UDP 是否可达
nc -u your-server-ip 443

# 检查防火墙
ufw status
iptables -L -n | grep 443
```

### 2. 速度不达预期

- 确认 `bandwidth` 设置是否合理
- 检查 QUIC 窗口大小
- 尝试关闭 Port Hopping（有些 VPS 的 nftables 规则会影响性能）

### 3. iOS Shadowrocket 连不上

把 `allowInsecure` 设为 `true`。如果你的证书是自签名的，这是必须的。

### 4. 流量异常大

Brutal 的副作用：它在高丢包环境下会消耗较多流量（重传 + FEC 开销）。如果你的 VPS 有流量限制，把 `bandwidth` 调低一点。

## 进阶玩法

### 搭配 Sing-Box 分流

Hysteria2 本身只是一个代理协议，如果你需要复杂的路由规则，可以用 sing-box 作为前端，Hysteria2 作为出站：

```json
{
  "outbounds": [
    {
      "type": "hysteria2",
      "tag": "hy2-out",
      "server": "your-server-ip",
      "server_port": 443,
      "password": "your-password",
      "tls": {
        "enabled": true,
        "server_name": "bing.com",
        "insecure": true
      }
    }
  ]
}
```

### Hysteria Realms：无公网 IP 也能建站

Hysteria2 新推出的 Realms 功能允许你在没有公网 IP 的环境（家庭宽带、蜂窝网络）运行代理服务器。它通过 NAT 穿透建立 P2P 直连。适合：

- 在家用树莓派跑代理
- 出差时用手机热点当节点
- 内网设备对外提供服务

## 总结

Hysteria2 是 2026 年速度最快的翻墙协议。它的 Brutal 拥塞控制 + QUIC 传输 + 端口跳跃三重组合，让它在高丢包、高延迟的跨境链路上表现远超传统方案。

**推荐配置组合**：
- 主力协议：Hysteria2（速度 + 端口跳跃）
- 备用协议：VLESS+Reality（隐蔽性 + 长连接稳定）
- 管理面板：3X-UI 或 Sing-Box

一条线路，两个协议，一个面板，你的 2026 翻墙方案就齐了。
