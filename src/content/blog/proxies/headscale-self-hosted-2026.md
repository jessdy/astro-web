---
title: Headscale 完全指南：自建 Tailscale 控制服务器，零成本私有组网
description: 用 Headscale 自建 Tailscale 协调服务器，搭配 DERP 中继和 WebUI，实现完全掌控的 WireGuard 私有网络。Docker 一键部署，支持 ACL 权限管理、OIDC 登录。
duration: 8min
date: 2026-05-28
tags: [Headscale, Tailscale, WireGuard, 组网, Docker, 代理]
---

Tailscale 是近几年最火的异地组网工具，基于 WireGuard 协议，打洞成功率极高，几乎零配置就能把多台设备连进同一个内网。但它有一个让自托管爱好者纠结的地方——**控制服务器跑在 Tailscale 官方那里**。你的设备列表、ACL 策略、Key 管理全部依赖 tailscale.com。

**Headscale** 就是来解决这个问题的。它是 Tailscale 控制服务器的开源替代，让你在自己的 VPS 上运行协调节点，所有数据完全自主掌控。本文带你从零开始，用 Docker 部署一套生产可用的 Headscale。

## Headscale vs Tailscale 官方：选哪个？

| 维度 | Tailscale 官方 | Headscale 自建 |
|------|---------------|---------------|
| 免费设备数 | 3 台（Free 版） | **无限制** |
| 数据控制 | Tailscale 云端 | **完全本地** |
| ACL 策略 | 支持 | 支持（更灵活） |
| SSO/OIDC | Google/Microsoft/GitHub 等 | **任意 OIDC 提供商** |
| DERP 中继 | 全球官方节点 | **可自建，也能用官方** |
| 维护成本 | 零 | 需要维护服务器 |
| 最新版本 | - | v0.28.0（2026-02） |

**适合自建 Headscale 的场景：**

- 设备超过免费版限制，又不想付费
- 需要细粒度 ACL 策略、审计日志
- 内网环境不允许连接外部控制平面
- 纯粹想折腾，喜欢自己掌握一切

如果你只有 2~3 台设备且对隐私没那么在意，Tailscale 官方就够了。但如果你有 NAS、软路由、多台 VPS、家人设备一起组网，Headscale 是更划算的选择。

## 架构原理

先搞清楚几个角色：

```
┌─────────────┐    ┌─────────────┐
│  设备 A      │    │  设备 B      │
│ (Tailscale   │    │ (Tailscale   │
│  客户端)     │    │  客户端)     │
└──────┬──────┘    └──────┬──────┘
       │                  │
       │  ① 注册/认证      │
       ▼                  ▼
┌──────────────────────────────┐
│       Headscale Server       │
│  - 设备管理 & Key 分发        │
│  - ACL 策略                  │
│  - DERP 中继（可选）          │
└──────────────────────────────┘
       │
       │  ② 当 P2P 直连失败时
       ▼
┌──────────────┐
│  DERP 中继   │  ← 流量通过中继转发
└──────────────┘
```

- **Headscale** = 协调服务器，负责设备认证、Key 分发、网络配置下发
- **Tailscale 客户端** = 安装在每台设备上，连接 Headscale 获取配置
- **DERP**（Detoured Encrypted Routing Protocol）= 当 NAT 打洞失败时的中继转发节点
- 数据面仍然是 **WireGuard 加密的 P2P 直连**，Headscale 不经过你的流量

## Docker Compose 一键部署

在 VPS（最低 1C1G 即可）上创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  headscale:
    image: headscale/headscale:0.28
    container_name: headscale
    restart: unless-stopped
    volumes:
      - ./config:/etc/headscale
      - ./data:/var/lib/headscale
    ports:
      - "8080:8080"
      - "9090:9090"
    command: headscale serve
    networks:
      - headscale

  headplane:
    image: ghcr.io/tale/headplane:latest
    container_name: headplane
    restart: unless-stopped
    volumes:
      - ./config:/etc/headscale:ro
      - ./headplane:/etc/headplane
    ports:
      - "3000:3000"
    environment:
      - HEADSCALE_CONFIG_PATH=/etc/headscale/config.yaml
    networks:
      - headscale

networks:
  headscale:
    driver: bridge
```

创建配置文件 `config/config.yaml`：

```yaml
server_url: https://hs.yourdomain.com  # 改为你的域名
listen_addr: 0.0.0.0:8080
metrics_listen_addr: 0.0.0.0:9090

grpc_listen_addr: 0.0.0.0:50443
grpc_allow_insecure: false

# 数据库使用 SQLite 即可（小规模），大规格用 PostgreSQL
db_type: sqlite3
db_path: /var/lib/headscale/db.sqlite

# 内嵌 DERP 中继
derp:
  server:
    enabled: true
    region_id: 999
    region_code: "myserver"
    region_name: "My DERP Server"
    stun_listen_addr: "0.0.0.0:3478"

  urls: []
  paths: []

  auto_update_enabled: true
  update_frequency: 24h

# 关闭不需要的日志
log:
  format: text
  level: info

# ACL 策略文件路径
acl_policy_path: /etc/headscale/acl.yaml

# DNS 配置
dns_config:
  override_local_dns: true
  nameservers:
    - 1.1.1.1
    - 8.8.8.8
```

启动：

```bash
docker compose up -d
```

Headscale 管理 API 在 `8080`，Headplane WebUI 在 `3000`。建议前面再套一个 Nginx 或者 Caddy 做反向代理 + HTTPS。

## Nginx 反向代理

```nginx
server {
    listen 443 ssl http2;
    server_name hs.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/hs.pem;
    ssl_certificate_key /etc/ssl/private/hs.key;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

如果你用 Caddy，更简单，两行：

```caddy
hs.yourdomain.com {
    reverse_proxy localhost:8080
}
```

## 创建用户和注册设备

Headscale 没有自带注册页面，需要通过命令行创建用户（namespace）：

```bash
# 进入容器
docker exec -it headscale sh

# 创建一个用户
headscale users create jessdy

# 为该用户生成预授权 Key（有效期 24h）
headscale preauthkeys create -u jessdy --reusable --expiration 24h
```

输出类似：`2311e5e5c28b3c9e8f2b3a4d...`

拿到 Key 后，在客户端机器上注册：

### Linux / macOS / Windows

```bash
# 先安装 tailscale 客户端（用 Tailscale 官方的即可）
curl -fsSL https://tailscale.com/install.sh | sh

# 指定 Headscale 服务器地址并注册
tailscale up --login-server=https://hs.yourdomain.com --authkey=你的预授权Key
```

### OpenWrt 路由器

```bash
opkg update
opkg install tailscale
tailscale up --login-server=https://hs.yourdomain.com --authkey=你的预授权Key
```

### Android / iOS

官方客户端支持自定义 Coordination Server。在设置中找到 "Use custom coordination server"，填入 `https://hs.yourdomain.com`，然后用预授权 Key 登录。

## 查看和管理设备

```bash
# 列出所有节点
headscale nodes list

# 查看某个节点详情
headscale nodes show <id>

# 删除节点
headscale nodes delete <id>

# 修改节点名称
headscale nodes rename <id> new-name
```

WebUI（Headplane）上的体验更好，可以直接看到设备在线状态、IP 分配、到期 Key 等。

## 自建 DERP 中继节点

Tailscale 打洞的成功率通常在 90% 以上，但那 10% 的情况会退化到 DERP 中继转发。Tailscale 官方的 DERP 节点都在海外，国内延迟较高。

Headscale 内嵌了 DERP 服务器，上面 config.yaml 已经启用了。你还可以在同一台或另一台 VPS 上单独部署：

```yaml
# docker-compose.yml 追加
derper:
  image: ghcr.io/yangchuansheng/derper:latest
  container_name: derper
  restart: unless-stopped
  environment:
    - DERP_DOMAIN=derp.yourdomain.com
    - DERP_CERT_MODE=letsencrypt
  ports:
    - "443:443"
    - "3478:3478/udp"
```

然后在 Headscale 的 `config.yaml` 中引用：

```yaml
derp:
  server:
    enabled: false  # 关闭内嵌 DERP
  urls:
    - https://controlplane.tailscale.com/derpmap/default  # 保留官方节点
  paths:
    - /etc/headscale/derp.yaml
```

创建 `config/derp.yaml`：

```yaml
regions:
  900:
    regionid: 900
    regioncode: "my-derp"
    regionname: "My DERP in HK"
    nodes:
      - name: "900a"
        regionid: 900
        hostname: "derp.yourdomain.com"
        ipv4: "1.2.3.4"
        stunport: 3478
```

客户端可以用 `tailscale netcheck` 查看当前使用的 DERP 节点和延迟。

## ACL 权限控制

Headscale 的 ACL 用 JSON/HuJSON 格式定义，放在 `config/acl.yaml`：

```json
{
  "groups": {
    "group:admin": ["jessdy@example.com"],
    "group:dev": ["dev1@example.com", "dev2@example.com"]
  },
  "hosts": {
    "nas": "100.64.0.5",
    "vps-prod": "100.64.0.10"
  },
  "acls": [
    // admin 组可以访问所有设备
    {
      "action": "accept",
      "src": ["group:admin"],
      "dst": ["*:*"]
    },
    // dev 组只能 SSH 到 nas
    {
      "action": "accept",
      "src": ["group:dev"],
      "dst": ["nas:22"]
    },
    // 允许所有设备 ping
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"],
      "proto": "icmp"
    }
  ],
  "tagOwners": {
    "tag:server": ["group:admin"],
    "tag:iot": ["group:admin"]
  }
}
```

修改后重新加载：

```bash
docker exec headscale headscale policy reload
```

这比 Tailscale 官方的 ACL 语法更直白，支持组、标签、协议级别控制。

## 性能与资源消耗

实测数据（VPS 1C1G，10 台设备在线）：

| 指标 | 数值 |
|------|------|
| 内存占用 | ~120MB |
| CPU 空闲时 | <1% |
| 数据库大小（SQLite） | ~5MB |
| WireGuard 吞吐量 | 取决于 VPS 带宽 |
| DERP 转发延迟 | +5-15ms（同区域） |

Headscale 本身非常轻量，真正吃资源的是 DERP 中继（如果跑大量流量），以及 PostgreSQL（如果你换成它）。

## 常见问题排查

**Q: 客户端连不上 Headscale？**
检查防火墙是否开放了 `8080`（HTTP）和 `50443`（gRPC）。用 `curl https://hs.yourdomain.com:8080/health` 验证服务可用。

**Q: 设备之间 ping 不通？**
运行 `tailscale status` 看节点是否在线。如果是 "relay" 状态说明走了 DERP 中继，直连可能因对称 NAT 失败。

**Q: 升级 Headscale 后出问题？**
Headscale 版本更新频繁，升级前务必看 [Release Notes](https://github.com/juanfont/headscale/releases)。用 Docker 的话先备份 `data/` 目录。

**Q: 可以同时连接 Tailscale 官方和 Headscale 吗？**
不可以，一台设备同时只能连接一个协调服务器。但可以用容器隔离。

## 总结

Headscale 把 Tailscale 最核心的协调层开放了出来，配合 Docker 部署和 Headplane WebUI，体验已经非常接近官方。如果你满足以下任一条件，强烈推荐自建：

- 设备数超过 3 台
- 需要完全的数据自主权
- 想在国内获得更低延迟的 DERP 中继
- 喜欢折腾网络基础设施

部署一次，长期受益。所有设备跑在同一个 `100.64.0.0/10` 内网里，无论物理位置在哪，体验就和局域网一样。

---

> **相关阅读**：[Sing-Box 终极配置指南](/proxies/sing-box-guide-2026) | [自托管隧道工具横评](/proxies/self-hosted-tunnel-tools-2026)
