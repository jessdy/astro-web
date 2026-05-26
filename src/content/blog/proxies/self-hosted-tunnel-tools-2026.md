---
title: 2026 自托管内网穿透终极指南：frp vs rathole vs bore 怎么选
description: 全面对比三大开源内网穿透工具 frp、rathole 和 bore，从性能、配置、安全性到实际部署，帮你选出最适合自托管的方案。
duration: 7min
date: 2026-05-27
tags: [内网穿透, frp, rathole, bore, 自托管, 反向代理, NAT穿透]
---

如果你在家跑 NAS、自建 Git 仓库、或者实验室有台 GPU 服务器想从外面访问，你应该已经和 NAT 打过交道了。运营商级 NAT（CGNAT）、家庭路由器双层 NAT、公司防火墙——这些都是横在你和你的服务之间的一堵墙。

Cloudflare Tunnel 和 ngrok 能解决这个问题，但它们要么绑定了 Cloudflare 生态，要么要花钱。而**自托管内网穿透工具**让你用自己的 VPS 做中继，数据不经过第三方，完全可控。

2026 年这个领域已经相当成熟。今天我们来聊三个最值得关注的开源方案：**frp、rathole、bore**。

---

## 先搞清楚：内网穿透到底在干什么

原理很简单：

```
你的电脑（内网） ──→ 公网 VPS（中继） ←── 外部用户
    │                      │
    └── 主动建立连接 ──────┘
```

内网设备主动向公网服务器发起一个长连接，外部流量打到公网服务器后，顺着这条连接转发进来。不需要你在路由器上开端口、不需要公网 IP。

---

## 选手一号：frp（Fast Reverse Proxy）

**GitHub**：[fatedier/frp](https://github.com/fatedier/frp) | ⭐ 100k+ | 语言：Go

frp 是这个领域的"老大哥"。从 2017 年开始维护至今，功能覆盖度是三者中最广的。

### 核心能力

| 功能 | 支持情况 |
|------|---------|
| TCP/UDP 转发 | ✅ |
| HTTP/HTTPS 转发 | ✅ 支持自定义域名 |
| P2P 模式 (xtcp) | ✅ 绕过服务器直连 |
| Web Dashboard | ✅ 自带管理面板 |
| 加密/压缩 | ✅ TLS + 可选压缩 |
| 负载均衡 | ✅ 多节点分组 |
| 服务端插件 | ✅ 支持自定义插件 |

### 最小部署

**服务端（VPS 上）**：

```toml
# frps.toml
bindPort = 7000
vhostHTTPPort = 8080

# Web 面板（可选）
webServer.addr = "0.0.0.0"
webServer.port = 7500
webServer.user = "admin"
webServer.password = "admin"
```

启动：

```bash
./frps -c frps.toml
```

**客户端（你的内网机器）**：

```toml
# frpc.toml
serverAddr = "你的VPS公网IP"
serverPort = 7000

[[proxies]]
name = "web"
type = "http"
localPort = 3000
customDomains = ["app.yourdomain.com"]
```

搞定后，外部访问 `app.yourdomain.com:8080` 就能打到内网的 3000 端口了。

### 适合谁

如果你需要**功能最全的方案**——多个服务、Web 面板管理、自定义域名、P2P 直连，frp 是不二之选。尤其适合跑多个服务、需要可视化管理的场景。

---

## 选手二号：rathole

**GitHub**：[rathole-org/rathole](https://github.com/rathole-org/rathole) | ⭐ 10k+ | 语言：Rust

rathole 的定位很明确：**比 frp 更轻、更快、更安全**。它砍掉了 dashboard、插件系统和 P2P，换来更简洁的配置和更少的资源占用。

### 亮点

- **Noise Protocol** 加密：默认就是加密通道，不需要额外配置 TLS
- **资源占用极低**：Rust 写的，内存通常在 5MB 以下
- **配置极其简单**：一个 TOML 文件搞定一切
- **高性能**：基准测试中吞吐量显著优于 frp

### 最小部署

**服务端**：

```toml
# server.toml
[server]
bind_addr = "0.0.0.0:2333"

[server.services.web]
token = "your-secret-token"
bind_addr = "0.0.0.0:8080"
```

**客户端**：

```toml
# client.toml
[client]
remote_addr = "你的VPS:2333"

[client.services.web]
token = "your-secret-token"
local_addr = "127.0.0.1:3000"
```

就这么简单。没有复杂的类型声明，rathole 会自动判断 TCP/HTTP。

### 适合谁

追求**极简和性能**的开发者。如果你只有几个服务需要穿透、不想折腾复杂配置、对资源占用敏感（比如跑在树莓派上），rathole 是最佳选择。

---

## 选手三：bore

**GitHub**：[ekzhang/bore](https://github.com/ekzhang/bore) | ⭐ 10k+ | 语言：Rust

bore 走的是**极致简化**路线。它甚至不需要配置文件——命令行一把梭。

### 特点

- **零配置启动**：客户端一行命令搞定
- **自动端口分配**：服务端自动分配端口号
- **自带免费公共服务**：`bore.pub` 可以试用（不推荐生产环境）
- **极简协议**：基于 TCP，无加密层（需要额外套一层）

### 使用方式

**服务端**：

```bash
bore server
# 默认监听 7835 端口
```

**客户端**：

```bash
bore local 3000 --to 你的VPS --port 7835
```

本地 3000 端口的服务就被暴露到 VPS 的某个端口上了。

### 适合谁

**临时调试、快速演示**场景。比如你要给同事看本地的 demo、临时暴露一个开发服务器。不适合长期生产使用，因为缺乏加密、认证和域名绑定。

---

## 横向对比

| 维度 | frp | rathole | bore |
|------|-----|---------|------|
| 语言 | Go | Rust | Rust |
| GitHub Stars | 100k+ | 10k+ | 10k+ |
| 配置复杂度 | 中 | 低 | 极低 |
| 加密 | TLS/可选 | Noise（默认） | 无（需自建） |
| Web Dashboard | ✅ | ❌ | ❌ |
| P2P 直连 | ✅ (xtcp) | ❌ | ❌ |
| 自定义域名 | ✅ | ❌ | ❌ |
| 负载均衡 | ✅ | ❌ | ❌ |
| 内存占用 | ~20MB | ~5MB | ~3MB |
| 适合场景 | 生产/多服务 | 轻量/单服务 | 临时调试 |

---

## 实际选型建议

### 选 frp，如果：

- 你需要暴露多个服务（NAS + Git + 开发环境...）
- 想用 Web 面板可视化管理隧道
- 需要自定义域名和 HTTPS
- 团队使用，需要多人协作
- 你想在内网设备之间建立 P2P 直连（大文件传输不再绕服务器）

### 选 rathole，如果：

- 只有 1-3 个服务需要穿透
- 跑在低配 VPS 或树莓派上，资源紧张
- 看重默认安全（Noise 加密）
- 喜欢简洁的 TOML 配置
- 对延迟和吞吐有极致追求

### 选 bore，如果：

- 只是临时调试，用完即弃
- 不想写任何配置文件
- 给同事快速演示本地项目

---

## 进阶：用 Nginx 套一层 HTTPS

不管选 frp 还是 rathole，如果你暴露的是 HTTP 服务，强烈建议在前面加一层 Nginx 反代并配上 Let's Encrypt SSL：

```nginx
server {
    listen 443 ssl;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080; # 隧道出口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

这样外部用户访问的就是标准的 HTTPS 了，你的服务安全又体面。

---

## 我的推荐

日常使用我倾向于 **rathole + Nginx** 的组合。rathole 的 Noise 加密管传输层、Nginx 管应用层的 HTTPS 和域名路由，各司其职，配置清晰。资源占用也低，一台 1C1G 的轻量云就够跑。

但如果你需要管十几条隧道、几个团队成员一起用，**frp 的 Dashboard** 会让运维体验提升一个档次——不用每次都 SSH 上去改配置文件。

至于 bore，把它当临时工具就好。就像你用完 `python -m http.server` 就关掉一样，bore 用完就停，别想着在上面跑生产。

---

## 延伸阅读

- [awesome-tunneling](https://github.com/anderspitman/awesome-tunneling) — 最全的内网穿透工具清单
- [frp 官方文档](https://gofrp.org/) — 中文友好，配置全覆盖
- [rathole 项目页](https://github.com/rathole-org/rathole) — README 本身就是一份不错的教程
