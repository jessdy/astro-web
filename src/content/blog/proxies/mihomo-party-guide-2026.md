---
title: Mihomo Party 完全指南：2026 年最强的 Clash Meta 桌面客户端
description: 深度评测 Mihomo Party（原 Clash Party）——基于 Electron 的 Mihomo 内核图形客户端，涵盖安装配置、TUN 模式、Sub-Store 联动、与 Clash Verge Rev 对比，以及进阶玩法。
duration: 7min
date: 2026-06-01
tags: [Mihomo Party, Clash Meta, 代理客户端, 科学上网, TUN模式]
---

## 为什么你需要关注 Mihomo Party？

2026 年的代理客户端生态已经发生了巨大变化。曾经统治桌面的 Clash for Windows（CFW）早已停更，Clash Verge Rev 凭借 Tauri 框架的轻量优势一度成为首选。但最近半年，一个叫 **Mihomo Party**（原名 Clash Party）的项目异军突起，GitHub 斩获 **24.2k Stars**，成为 Mihomo 生态中最活跃的 GUI 客户端。

这不是又一个换皮项目。Mihomo Party 在功能深度上超越了所有同类，尤其是在 **Sub-Store 集成、WebDAV 云备份、智能覆写** 这三个维度，直接拉高了代理客户端的体验天花板。

## Mihomo Party 是什么？

简单说：**Mihomo Party 是 Mihomo（原 Clash Meta）内核的 Electron 桌面 GUI**。

| 属性 | 详情 |
|------|------|
| GitHub | [mihomo-party-org/mihomo-party](https://github.com/mihomo-party-org/mihomo-party) |
| Stars | 24.2k+ |
| 框架 | Electron + TypeScript |
| 内核 | Mihomo（Clash Meta） |
| 平台 | Windows / macOS / Linux |
| 官网 | [mihomoparty.app](https://mihomoparty.app) |
| 开源协议 | GPL-3.0 |

它的前身是 Clash Party，2025 年底改名 Mihomo Party，随之进行了一次大规模重构，UI 和内核集成都焕然一新。

## 核心功能拆解

### 1. 订阅管理：不止是导入

Mihomo Party 的订阅管理远不止"粘贴链接→更新"这么简单。它内置了：

- **多订阅合并**：同时挂载多个机场订阅，自动去重节点
- **订阅预处理**：支持 JavaScript 覆写脚本，可以在订阅内容进入 Mihomo 内核之前进行修改——比如自动替换节点名称、过滤低倍率节点、注入自定义规则
- **自动测速排序**：更新订阅后自动对节点进行延迟测试，按速度排序

### 2. Sub-Store 深度集成

这是 Mihomo Party 最亮眼的差异化功能。**Sub-Store** 是一个独立的订阅管理工具，而 Mihomo Party 把它直接嵌入了客户端内部。

```
┌─────────────────────────────────────────┐
│           Mihomo Party                  │
│  ┌─────────────────────────────────┐    │
│  │     Sub-Store (内置)            │    │
│  │  • 订阅转换                       │    │
│  │  • 节点过滤                       │    │
│  │  • 规则组合                       │    │
│  │  • 多机场聚合                     │    │
│  └──────────┬──────────────────────┘    │
│             ▼                           │
│  ┌─────────────────────────────────┐    │
│  │     Mihomo 内核                 │    │
│  │  • 规则路由                       │    │
│  │  • TUN/TAP                       │    │
│  │  • DNS 防泄漏                     │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

有了这个集成，你不需要再单独部署 Sub-Store 服务，也不用在浏览器里编辑订阅规则——一切都在客户端内完成。

### 3. TUN 模式：真正的全局代理

Mihomo Party 的 TUN 模式基于 Mihomo 内核的网络协议栈，提供三种实现：

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| **System** | 使用系统协议栈，最稳定 | 日常使用首选 |
| **gVisor** | 用户空间网络栈，隔离性强 | 安全需求高 |
| **Mixed** | TCP 用 system，UDP 用 gVisor | 游戏/UDP 场景 |

TUN 模式对不遵循系统代理的应用（如终端、Docker、游戏）特别重要。开启后所有流量都会被 Mihomo 接管，不会出现"浏览器能翻、但终端翻不了"的尴尬。

### 4. WebDAV 云备份

配置丢了是代理用户最怕的事。Mihomo Party 支持通过 WebDAV 协议自动备份配置到：

- **自建 NAS**（群晖、威联通等）
- **NextCloud / ownCloud**
- **坚果云**
- 任何支持 WebDAV 的云服务

设置一次后，每次修改配置都会自动同步。换电脑时只需填入 WebDAV 地址，所有配置一键恢复。

### 5. 智能覆写（Override Hub）

Mihomo Party 引入了 **Override** 机制，允许用户在不修改原始订阅内容的情况下，叠加自定义规则：

```yaml
# override.yaml 示例
proxy-groups:
  - name: 🎯 手动选择
    type: select
    proxies:
      - 🇭🇰 香港优选
      - 🇯🇵 日本优选
      - 🇸🇬 新加坡优选

rules:
  - DOMAIN-SUFFIX,openai.com,🎯 手动选择
  - DOMAIN-SUFFIX,claude.ai,🎯 手动选择
  - GEOIP,CN,DIRECT
  - MATCH,🎯 手动选择
```

配合官方的 [override-hub](https://github.com/mihomo-party-org/override-hub) 仓库，你可以一键套用社区维护的规则集，覆盖 ChatGPT、Netflix、Disney+ 等流媒体的分流策略。

## 安装与上手

### Windows

1. 前往 [Releases 页面](https://github.com/mihomo-party-org/mihomo-party/releases) 下载最新 `.exe` 安装包
2. 安装时如遇 SmartScreen 警告，点击「更多信息」→「仍要运行」
3. 首次启动会自动下载 Mihomo 内核
4. 点击左侧「订阅」→ 粘贴机场订阅链接 → 点击更新
5. 切换到「代理」页 → 选择节点 → 开启系统代理

### macOS

```bash
# 如果使用 Homebrew（社区维护）
# 建议直接下载 dmg 安装包

# 首次打开如提示「无法验证开发者」
# 系统设置 → 隐私与安全性 → 仍要打开
```

macOS 版同样支持 TUN 模式，需要在系统设置中允许 VPN 配置。

### Linux

提供 AppImage 和 deb 两种格式：

```bash
# AppImage
chmod +x Mihomo-Party-*.AppImage
./Mihomo-Party-*.AppImage

# Debian/Ubuntu
sudo dpkg -i mihomo-party_*.deb
```

## Mihomo Party vs Clash Verge Rev：怎么选？

这是代理圈子最常被问到的问题。两者都是 Mihomo 内核的 GUI，但技术路线截然不同：

| 维度 | Mihomo Party | Clash Verge Rev |
|------|-------------|-----------------|
| **框架** | Electron | Tauri |
| **内存占用** | ~300-500MB | ~100-200MB |
| **启动速度** | 稍慢 | 快 |
| **Sub-Store** | ✅ 内置 | ❌ 需外部部署 |
| **WebDAV 备份** | ✅ 内置 | ❌ 无 |
| **智能覆写** | ✅ Override Hub | 手动编辑 |
| **UI 美观度** | ⭐⭐⭐⭐⭐ 现代化 | ⭐⭐⭐⭐ 简洁 |
| **功能深度** | 丰富 | 够用 |
| **社区活跃度** | 🔥 极活跃 | 维护模式 |

**我的建议**：

- 如果你追求**开箱即用的完整体验**、经常折腾多机场订阅、需要云备份 → 选 **Mihomo Party**
- 如果你追求**极致轻量**、内存敏感（比如只有 8GB RAM）、只想安安静静用代理 → Clash Verge Rev 依然够用
- 好消息是：**两者的订阅格式完全互通**，你可以两个都装，随时切换，不用重新配置

## 进阶技巧

### 1. 利用 Override Hub 一键接入 AI 服务

```yaml
# 在 Override 中引用官方 AI 规则集
rule-providers:
  ai-services:
    type: http
    behavior: classical
    url: "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/rules/ai-services.yaml"
    path: ./ruleset/ai-services.yaml
    interval: 86400
```

这样 ChatGPT、Claude、Gemini 等 AI 服务会自动走代理，不用手动添加规则。

### 2. 订阅预处理脚本

在「订阅」→「预处理」中，可以写 JavaScript 脚本修改订阅内容：

```javascript
// 示例：自动过滤低倍率节点
function preprocess(proxies) {
  return proxies.filter(p => {
    // 过滤掉名称中包含 "x0.1" 或 "x0.5" 的低倍率节点
    return !p.name.match(/x0\.[15]/);
  });
}
```

### 3. DNS 防泄漏配置

在 Mihomo Party 的 DNS 设置中，建议使用以下配置避免 DNS 泄漏：

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - https://doh.pub/dns-query
    - https://dns.alidns.com/dns-query
  fallback:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query
```

配合 `fake-ip` 模式，DNS 解析完全在 Mihomo 内部完成，彻底杜绝泄漏。

## 常见问题

**Q: Mihomo Party 安全吗？会不会偷订阅？**

A: 完全开源（GPL-3.0），代码托管在 GitHub，任何人都可以审计。网络请求只发向你的订阅地址和 Mihomo 内核本地端口。如果你还是不放心，可以在防火墙层面限制它的出站连接。

**Q: Electron 会不会太占内存？**

A: 闲置状态 ~200MB，活跃状态 ~500MB。对于 2026 年的主流电脑（16GB+ RAM）来说完全不是问题。如果你在用 8GB 的老机器，确实会感到压力，这种情况建议用 Clash Verge Rev。

**Q: 和 Surge / Quantumult X 比呢？**

A: Surge 和 Quantumult X 是 macOS/iOS 专属的付费软件，功能更全但需要额外购买。Mihomo Party 免费开源，跨三大桌面平台，且社区驱动的规则更新更快。移动端还是推荐 Shadowrocket（iOS）或 Surfboard（Android）。

**Q: 为什么改名叫 Mihomo Party？**

A: 2025 年底，项目团队决定将名称从 Clash Party 改为 Mihomo Party，更准确地反映所用内核（Mihomo = Clash Meta），同时与已停更的原版 Clash 划清界限。

## 总结

Mihomo Party 是目前功能最全面的免费开源代理客户端。它不止是一个 GUI 壳，而是围绕 Mihomo 内核构建的**完整代理管理生态**——Sub-Store 订阅工厂、Override Hub 规则市场、WebDAV 云同步，每一项都解决了实际痛点。

如果你还在用一年前装的 Clash Verge Rev，或者还在折腾手写 YAML 配置，强烈建议花 10 分钟试试 Mihomo Party。体验差距可能比你想象的大得多。

---

> **推荐阅读**：[代理面板全对比：X-UI / 3X-UI / Hiddify / Marzban 怎么选？](/proxies/proxy-panels-comparison-2026)
