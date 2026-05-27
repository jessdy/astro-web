---
title: Perplexity 开源 Bumblebee：开发者终端的供应链安全扫描利器
description: Perplexity AI 开源的 Bumblebee 是一个零依赖的 Go 二进制扫描器，能快速盘点开发者机器上所有包、插件和扩展，精准定位供应链漏洞。发布 7 天斩获 3200+ Star。
duration: 6min
date: 2026-05-27
tags: [开源, 安全, 供应链, Go, Perplexity]
---

## 又一个供应链漏洞？这次你机器上有吗

供应链安全事件这两年越来越多——某个 npm 包被投毒、某个 PyPI 包被劫持、某个 VS Code 插件窃取密钥。安全团队发 advisory 说「请立即排查是否使用了 xxx@1.2.3」，然后你怎么办？

`npm ls` 一个个项目跑？`pip list` 看全局装了什么？VS Code 插件一个个点开检查版本？对于个人开发者还行，如果你管着 50 台 MacBook 的开发团队，这事就没那么简单了。

Perplexity AI 上周开源了一个工具叫 **Bumblebee**，专门解决这个问题。发布仅 7 天就在 GitHub 拿到 3200+ Star，在开发者安全圈引起了不少讨论。

> GitHub: [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee)

## Bumblebee 是干什么的

一句话概括：**Bumblebee 是一个只读的开发者终端资产盘点工具**。它不装任何 agent、不执行任何包管理器命令、不需要网络访问——纯粹读取磁盘上的 lockfile 和 manifest 文件，然后吐出一份结构化的 NDJSON 清单。

它的核心使用场景很明确：

> 当安全 advisory 说「xxx 包 1.2.3 版本有漏洞」，安全团队需要立刻知道——**公司里哪些开发者的机器上有这个包？**

SBOM 能告诉你软件里「应该」有什么，EDR 能告诉你「跑了什么」，但没人告诉你开发者本地环境里「正躺着什么」。Bumblebee 补的正是这个缺口。

## 覆盖面有多广

Bumblebee 支持的生态系统非常全面：

| 生态 | 扫描来源 |
|------|---------|
| **npm** | `package-lock.json`, `npm-shrinkwrap.json`, `node_modules/.../package.json` |
| **pnpm** | `pnpm-lock.yaml`, `.pnpm/.../package.json` |
| **Yarn** | `yarn.lock` (Classic + Berry) |
| **Bun** | `bun.lock`, `bun.lockb` |
| **PyPI** | `*.dist-info/METADATA`, `*.egg-info/PKG-INFO` |
| **Go** | `go.sum`, `go.mod` |
| **RubyGems** | `Gemfile.lock`, `*.gemspec` |
| **Composer** | `composer.lock`, `vendor/composer/installed.json` |
| **MCP** | `mcp.json`, `claude_desktop_config.json`, `cline_mcp_settings.json` 等 |
| **编辑器插件** | VS Code / Cursor / Windsurf / VSCodium 的 `extensions.json` |
| **浏览器插件** | Chrome 系 `manifest.json` + Firefox `extensions.json` |

覆盖了主流包管理器、MCP 配置（这个在 AI 时代尤其重要）、甚至编辑器和浏览器插件。对于用 MCP 工具的开发者来说，Bumblebee 能扫描出你配置了哪些 MCP server——这些 server 本身就是供应链的一部分。

## 三个扫描 Profile

Bumblebee 设计了三档扫描深度，对应不同场景：

```bash
# baseline: 全局包 + 编辑器/浏览器插件 + MCP 配置
# 适合日常定时巡检，轻量快速
bumblebee scan --profile baseline > inventory.ndjson

# project: 指定开发目录，比如 ~/code
# 适合针对团队项目空间的定期盘点
bumblebee scan --profile project \
  --root "$HOME/code" \
  --root "$HOME/Developer"

# deep: 任意路径，配合 exposure catalog 做精准排查
# 适合应急响应——知道某个包有问题，立刻全盘扫描
bumblebee scan --profile deep \
  --root "$HOME" \
  --exposure-catalog ./advisory-catalog.json \
  --max-duration 10m
```

profile 设计很实用：平时用 `baseline` 定时跑，项目空间用 `project`，出了安全事件立刻切 `deep` 精准打击。

## 安装和自检

唯一的依赖是 Go 1.25+：

```bash
go install github.com/perplexityai/bumblebee/cmd/bumblebee@latest
```

装完跑一下自检，确认扫描引擎正常工作：

```bash
bumblebee selftest
# selftest OK (2 findings in 1ms)
```

这个 `selftest` 设计挺讲究——二进制内嵌了假的恶意包 fixture，用故意伪造的包名（`bumblebee-selftest-evil@0.0.0`）测试扫描逻辑。没有任何网络调用，纯本地验证。如果自检失败，说明当前安装有问题，别往生产推。

在大规模部署场景下，这个自检可以作为 pre-flight check：MDM 推送安装 → 跑 selftest → 通过才纳入 fleet。

## 输出格式

Bumblebee 输出 NDJSON（每行一条 JSON 记录），直接 pipe 或重定向到文件：

```json
{
  "record_type": "package",
  "ecosystem": "npm",
  "package_name": "@tanstack/query-core",
  "version": "5.59.20",
  "project_path": "/Users/alex/code/web-app",
  "source_file": "/Users/alex/code/web-app/pnpm-lock.yaml",
  "confidence": "high"
}
```

每条记录带 `confidence` 标记——`high` 代表从规范的 lockfile/metadata 中解析出来的精确版本。每条扫描结束还有一个 `scan_summary` 记录，下游接收器可以据此判断是否采用本次扫描结果。

## 为什么值得关注

**1. 设计哲学干净**

零非标准库依赖、单一静态二进制、只读不执行。这在安全工具里是黄金标准——你不会希望一个「安全扫描器」本身引入新的攻击面。Go 写的单二进制意味着 macOS 和 Linux 上直接跑，不需要 Python/runtime/容器。

**2. MCP 配置扫描是前瞻设计**

MCP（Model Context Protocol）在 AI 开发中越来越普及，`mcp.json` 里的 server 配置实际上构成了新的供应链攻击面——你的 AI 工具连接了哪些外部服务？它们的 `env` 里有没有敏感信息？Bumblebee 是第一个把 MCP 配置纳入供应链扫描范围的工具。

**3. Perplexity 为什么要做这个**

Perplexity 自己就是开发者工具公司，内部有大量开发机器需要管理。Bumblebee 明显是「先解决自己的问题再开源」的产物——README 里对 fleet rollout、MDM 部署、receiver-side state model 的考虑，一看就是在生产环境打磨过的。

**4. 开源协议友好**

MIT 协议，随便用、随便改、随便集成。企业安全团队可以直接 fork 内部分发。

## 局限和待改进

目前 v0.1 版本的一些限制：

- **仅 macOS 和 Linux**，Windows 不在支持范围
- **不支持 Codex TOML 配置和 Continue YAML 配置**的 MCP 扫描
- **没有内置的中央收集 / dashboard**——需要自己搭接收端
- **扫描结果依赖文件存在**——如果开发者手动删了 lockfile，就扫不到

不过这些都在 roadmap 上，且 Bumblebee 定位很清楚：它只做采集层，接收和展示留给你的 SIEM / 安全平台。

## 怎么用在你的团队里

如果你管着开发团队，可以这样落地：

1. **日常巡检**：cron / launchd 定时跑 `baseline`，结果发到中央日志系统
2. **新人入职**：MDM 推送安装 Bumblebee，跑 `selftest` 验证
3. **安全事件**：收到 advisory → 写一份 exposure catalog JSON → 全员跑 `deep` 扫描 → 5 分钟出结果
4. **定期审计**：每月一次 `project` 扫描，盘点项目依赖健康度

对于个人开发者，简单跑个 `baseline` 看看自己机器上到底躺了多少包，也是个不错的习惯。

## 总结

Bumblebee 解决的是一个真实痛点：供应链安全的「最后一公里」——开发者的本地环境。工具设计干净、覆盖面广、开源协议友好。3200 Star 不是没道理的。

在当前每两周就有供应链安全事件的节奏下，这类工具会越来越刚需。如果你关注 DevSecOps 或负责团队安全，值得放进工具箱。

---

**相关链接：**

- [GitHub: perplexityai/bumblebee](https://github.com/perplexityai/bumblebee)
- [Bumblebee 官方文档 - 扫描源覆盖](https://github.com/perplexityai/bumblebee/blob/main/docs/inventory-sources.md)
- [Bumblebee 官方文档 - 传输与状态模型](https://github.com/perplexityai/bumblebee/blob/main/docs/transport.md)
