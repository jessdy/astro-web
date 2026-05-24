---
title: Sing-Box 完全指南：2026 年最强通用代理平台
description: 从零掌握 sing-box —— 一个二进制文件搞定 VLESS、Hysteria2、TUIC 等全部主流协议，替代 V2Ray/Xray 的下一代代理核心
duration: 7min
date: 2026-05-24
tags: [sing-box, 代理, VLESS, Reality, Hysteria2, TUIC, 翻墙]
---

## 为什么你需要关注 sing-box？

如果你还在用 V2Ray 或 Xray，是时候认识一下 **sing-box** 了。

sing-box 是一个用 Go 语言编写的**通用代理平台**，由 SagerNet 团队开发维护。它最核心的理念是：**一个二进制文件，搞定所有代理协议**。不管你需要 VLESS + Reality、Hysteria2、TUIC、Shadowsocks、Trojan 还是 WireGuard，sing-box 全都能跑，而且服务端和客户端用同一套配置逻辑。

截至 2026 年 5 月，sing-box 在 GitHub 上已获得超过 **35k Stars**，最新版本为 v1.14.0-alpha，是代理圈增长最快的项目之一。

## sing-box vs Xray/V2Ray：为什么选它？

| 对比维度 | sing-box | Xray-core | V2Ray |
|---------|----------|-----------|-------|
| 语言 | Go | Go | Go |
| 配置格式 | JSON（标准） | JSON（自定义） | JSON（自定义） |
| TUN 模式 | 原生支持，性能优秀 | 需额外配置 | 不支持 |
| 协议覆盖 | VLESS/VMess/Trojan/Hysteria2/Shadowsocks/WireGuard/TUIC/SSH | VLESS/VMess/Trojan/Shadowsocks | VMess/Shadowsocks |
| 多合一 | 服务端+客户端一体 | 服务端+客户端一体 | 服务端+客户端分离 |
| QUIC 协议 | Hysteria2、TUIC 原生 | 需额外工具 | 不支持 |
| 社区活跃度 | 🚀 快速增长 | 稳定 | 放缓 |

一句话总结：**Xray 能做的 sing-box 都能做，sing-box 能做的 Xray 不一定能做**。尤其是 Hysteria2 和 TUIC 的原生支持，让 sing-box 在高丢包网络环境下有天然优势。

## sing-box 支持的协议一览

```
入站/出站协议：
├── VLESS + Reality / Vision / XTLS
├── VMess + AEAD
├── Trojan + TLS
├── Hysteria2 (QUIC)        ← 延迟敏感场景首选
├── TUIC (QUIC)             ← 轻量级 UDP 代理
├── Shadowsocks (2022)      ← 经典加密代理
├── WireGuard               ← 内核级 VPN
├── SSH / Direct / SOCKS / HTTP
└── ShadowTLS / NaiveProxy  ← 抗封锁混淆
```

这意味着你可以用 sing-box 替代 Clash、V2Ray、Hysteria、WireGuard 等多个工具，统一管理所有代理链路。

## 服务端部署：VLESS + Reality 一键上手

以下是最推荐的组合：**VLESS + Reality + XTLS Vision**，无需域名、无需 TLS 证书，抗封锁能力极强。

### 1. 安装 sing-box

```bash
# 一键安装脚本（Debian/Ubuntu）
bash <(curl -fsSL https://sing-box.app/deb-install.sh)

# 或手动下载二进制
curl -Lo sing-box.tar.gz https://github.com/SagerNet/sing-box/releases/download/v1.11.0/sing-box-1.11.0-linux-amd64.tar.gz
tar xzf sing-box.tar.gz
cp sing-box-*/sing-box /usr/local/bin/
```

### 2. 生成 Reality 密钥对

```bash
sing-box generate reality-keypair
# 输出示例：
# PrivateKey: 2KZt4G6...（自己保留）
# PublicKey:  hQz8nR3...（可公开）
```

### 3. 服务端配置 `/etc/sing-box/config.json`

```json
{
  "log": { "level": "info" },
  "inbounds": [
    {
      "type": "vless",
      "tag": "vless-in",
      "listen": "::",
      "listen_port": 443,
      "users": [
        {
          "uuid": "your-uuid-here",
          "flow": "xtls-rprx-vision"
        }
      ],
      "tls": {
        "enabled": true,
        "server_name": "www.microsoft.com",
        "reality": {
          "enabled": true,
          "handshake": {
            "server": "www.microsoft.com",
            "server_port": 443
          },
          "private_key": "your-private-key",
          "short_id": ["a1b2c3d4"]
        }
      },
      "multiplex": { "enabled": true }
    }
  ],
  "outbounds": [
    { "type": "direct", "tag": "direct" }
  ]
}
```

### 4. 启动服务

```bash
systemctl enable sing-box
systemctl start sing-box
sing-box status  # 检查运行状态
```

到这里，你的 VPS 上就跑着一个 sing-box 服务端了，端口 443，伪装成微软官网流量。

## 客户端配置：全平台方案

sing-box 官方提供 CLI 客户端，社区则有丰富的 GUI 客户端。

### 客户端选择

| 平台 | 推荐客户端 | 备注 |
|------|-----------|------|
| Windows | sing-box CLI / NekoRay | TUN 模式全局代理 |
| macOS | sing-box CLI / sing-box for macOS | 原生 Apple Silicon |
| Linux | sing-box CLI | systemd 守护进程 |
| Android | sing-box Android (Google Play) | 原生 GUI |
| iOS | Sing-box / Shadowrocket | App Store 可下载 |
| 路由器 | sing-box + OpenWrt 插件 | 全屋代理 |

### 客户端配置示例（VLESS + Reality）

```json
{
  "log": { "level": "info" },
  "dns": {
    "servers": [
      { "tag": "dns-remote", "address": "tls://8.8.8.8", "detour": "proxy" }
    ],
    "rules": [
      { "rule_set": "geosite-cn", "server": "local" }
    ]
  },
  "inbounds": [
    {
      "type": "tun",
      "tag": "tun-in",
      "interface_name": "tun0",
      "address": ["172.19.0.1/30"],
      "auto_route": true,
      "strict_route": true,
      "stack": "mixed"
    }
  ],
  "outbounds": [
    {
      "type": "vless",
      "tag": "proxy",
      "server": "你的VPS-IP",
      "server_port": 443,
      "uuid": "your-uuid-here",
      "flow": "xtls-rprx-vision",
      "tls": {
        "enabled": true,
        "server_name": "www.microsoft.com",
        "utls": {
          "enabled": true,
          "fingerprint": "chrome"
        },
        "reality": {
          "enabled": true,
          "public_key": "your-public-key",
          "short_id": "a1b2c3d4"
        }
      },
      "multiplex": { "enabled": true }
    },
    { "type": "direct", "tag": "direct" }
  ],
  "route": {
    "rule_set": [
      { "tag": "geosite-cn", "type": "remote", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geosite/rule-set/geosite-cn.srs" },
      { "tag": "geoip-cn", "type": "remote", "format": "binary", "url": "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs" }
    ],
    "rules": [
      { "rule_set": "geosite-cn", "outbound": "direct" },
      { "rule_set": "geoip-cn", "outbound": "direct" }
    ]
  }
}
```

客户端配置要点：

1. **TUN 入站** — `auto_route: true` 自动接管系统流量，实现全局代理
2. **uTLS 指纹** — `fingerprint: chrome` 让 TLS 握手看起来像 Chrome 浏览器
3. **DNS 分流** — 国内域名走本地 DNS，国外走加密 DNS
4. **规则路由** — 用 geosite/geoip 自动分流，国内直连、国外代理
5. **Multiplex** — 多路复用减少连接开销，提升速度

## 进阶玩法

### Hysteria2 入站（高丢包网络救星）

```json
{
  "type": "hysteria2",
  "tag": "hy2-in",
  "listen": "::",
  "listen_port": 8443,
  "users": [
    { "password": "your-strong-password" }
  ],
  "tls": {
    "enabled": true,
    "acme": {
      "domain": ["your-domain.com"],
      "email": "admin@your-domain.com"
    }
  }
}
```

Hysteria2 基于 QUIC 协议，在 20% 丢包率下吞吐量可达传统 TCP 协议的 **3-5 倍**，是垃圾 VPS 和移动网络的最佳搭档。

### TUIC 入站（轻量 UDP）

```json
{
  "type": "tuic",
  "tag": "tuic-in",
  "listen": "::",
  "listen_port": 9443,
  "users": [
    { "uuid": "your-uuid", "password": "your-password" }
  ],
  "tls": {
    "enabled": true,
    "acme": {
      "domain": ["your-domain.com"],
      "email": "admin@your-domain.com"
    }
  }
}
```

### 同时运行多个协议

sing-box 的真正威力在于**一个实例跑多个入站协议**：

```json
{
  "inbounds": [
    { "type": "vless", "tag": "vless-in", ... },
    { "type": "hysteria2", "tag": "hy2-in", ... },
    { "type": "tuic", "tag": "tuic-in", ... },
    { "type": "shadowsocks", "tag": "ss-in", ... }
  ]
}
```

一个 VPS，四种协议同时在线，不同设备、不同网络环境各取所需。

## 注意事项

1. **Reality 的 `server_name`**：务必选择一个未被墙的大站（如 microsoft.com、cloudflare.com），且端口与你监听的端口一致
2. **防火墙**：记得开放对应端口（`ufw allow 443/tcp`、`ufw allow 8443/udp`）
3. **BBR 加速**：`echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf && echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf`
4. **IPv6**：如果 VPS 有 IPv6，配置 `"listen": "::"` 可以同时监听 IPv4 和 IPv6

## 总结

sing-box 是 2026 年代理工具的**事实标准**。它用一套统一的 JSON 配置替代了 V2Ray + Hysteria + TUIC 的组合，大幅降低了运维复杂度，同时性能不降反升。

- 🚀 **一个二进制**：告别多工具拼凑
- 🔐 **Reality 抗封锁**：无需域名和证书
- ⚡ **QUIC 协议集群**：Hysteria2 + TUIC 双剑合璧
- 🎯 **TUN 全局代理**：真正的系统级透明代理
- 📱 **全平台支持**：Windows/macOS/Linux/iOS/Android/路由器

如果你还没试过 sing-box，今天就动手吧——你的 VPS 值得一个更好的代理核心。
