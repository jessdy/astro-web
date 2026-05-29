---
title: "CodeGraph：为 AI 编程助手装上代码知识图谱，Token 消耗直降 35%"
description: "CodeGraph 是一个 100% 本地的预索引代码知识图谱，通过 tree-sitter + SQLite + MCP 让 Claude Code、Cursor 等 AI 编程工具的工具调用减少 94%、代码探索速度提升 77%。"
duration: 6min
date: 2026-05-29
tags: ["CodeGraph", "AI编程", "MCP", "开源", "知识图谱", "Claude Code"]
---

## 一句话概括

CodeGraph 是 2026 年 5 月 GitHub 上增长最快的开源项目之一（月增 28K+ stars，总 31K+），由 Colby McHenry 开发。它在 AI 编程助手启动前，把你的代码库预索引成一个可查询的语义知识图谱，让 AI 不再盲目扫描文件，而是直接查询结构化信息——**工具调用减少 94%，探索速度提升 77%，API 成本直降约 35%**。

## 为什么你需要 CodeGraph？

用 AI 编程助手（Claude Code、Cursor、Codex CLI 等）处理中大型项目时，你一定见过这个场景：

> 你问 AI：「这个 API 接口的鉴权逻辑在哪？」

然后 AI 开始疯狂操作——`grep`、`glob`、`ls`、`read`、`find`……十几二十次工具调用后，它终于找到了目标文件，开始读代码。等它真正开始回答问题时，几百上千个 token 已经烧在了「找路」上。

CodeGraph 解决的就是这个问题：**把「找路」前置**。

它在后台用 tree-sitter 解析你的代码库，提取符号关系、调用链、导入图、Web 路由等信息，存入本地 SQLite 数据库（FTS5 全文索引），再通过 MCP（Model Context Protocol）暴露 8 个查询工具。AI 助手不再需要漫无目的地扫描，而是直接查询图谱——通常两次调用就能定位目标。

## 核心架构

```
你的代码库
    │
    ▼
tree-sitter 解析（多语言 AST）
    │
    ▼
SQLite + FTS5 知识图谱（本地存储）
    │
    ▼
MCP Server（8 个查询工具）
    │
    ▼
Claude Code / Cursor / Codex / Gemini / ...
```

### 技术栈

| 组件 | 技术选型 |
|------|---------|
| 代码解析 | tree-sitter（支持多语言 AST） |
| 索引存储 | SQLite + FTS5 全文搜索 |
| 对外接口 | MCP（Model Context Protocol） |
| 安装方式 | npm 全局包 |
| 运行环境 | Node.js，100% 本地 |

### 支持的 AI 编程工具

CodeGraph 开箱即用支持主流 AI 编程助手：

- **Claude Code**（Anthropic）
- **Cursor**
- **Codex CLI**（OpenAI）
- **Gemini CLI**（Google）
- **OpenCode**
- **AntiGravity**
- **Kiro**
- **Hermes Agent**

一套 CodeGraph 全局安装，在所有这些工具中都能用。

## 快速上手

### 1. 安装

```bash
npm install -g @colbymchenry/codegraph
```

### 2. 初始化项目

在项目根目录运行：

```bash
codegraph init
```

交互式安装器会引导你完成配置——选择集成的 AI 工具、指定忽略目录、确认索引范围。初始化后，项目根目录会生成一个 `.codegraph/` 文件夹。

### 3. 索引代码库

```bash
codegraph index
```

这一步 tree-sitter 会扫描整个代码库，构建知识图谱。索引完成后，AI 助手就能自动发现并使用了——只要检测到 `.codegraph/` 目录存在。

### 4. 验证

```bash
codegraph status
```

查看索引摘要：符号总数、文件覆盖率、语言分布等。

### 5. 日常使用

之后正常使用 Claude Code 或 Cursor 即可。AI 会自动通过 MCP 查询 CodeGraph，你甚至感觉不到它的存在——除了明显更快的响应速度和更少的工具调用。

## 8 个 MCP 查询工具

CodeGraph 通过 MCP 暴露以下工具给 AI 助手：

| 工具 | 用途 |
|------|------|
| `codegraph_context` | 获取某个代码区域的上下文图谱 |
| `codegraph_explore` | 深度探索相关源码 |
| `codegraph_symbols` | 按名称/类型搜索符号 |
| `codegraph_callers` | 查找某个函数的所有调用者 |
| `codegraph_callees` | 查找某个函数调用的所有函数 |
| `codegraph_imports` | 追踪导入/依赖链 |
| `codegraph_routes` | 查询 Web 路由（支持 Express/Next.js 等） |
| `codegraph_trace` | 端到端追踪调用链（跨语言边界） |

最强大的特性是 **跨语言追踪**：`codegraph_trace` 可以跨越语言边界连接调用链——比如 TypeScript 前端 → Python 后端 API → SQL 查询，一条链路打通到底。

## 实际效果：用数据说话

来自社区实测和开发者反馈：

| 指标 | 不使用 CodeGraph | 使用 CodeGraph | 改善 |
|------|-----------------|---------------|------|
| 单次查询工具调用 | 10-15 次 | 1-3 次 | **↓ 85-94%** |
| 代码探索耗时 | 基线 | 基线 × 0.23 | **快 77%** |
| API Token 消耗 | 基线 | 基线 × 0.65 | **省 35%** |
| 文件读取次数 | 多次 grep+read | 通常 0 次 | **几乎归零** |

一个典型场景：开发者问「用户注册流程涉及哪些文件？」，不用 CodeGraph 时 AI 会 spawn 多个 Explore 子代理，产生几十次工具调用；用了 CodeGraph 后，两次查询（`codegraph_context` + `codegraph_explore`）直接出结果。

## 与竞品对比

| | CodeGraph | Sourcegraph | Cody | 传统 grep |
|------|-----------|-------------|------|-----------|
| 本地运行 | ✅ 100% | ❌ 需服务端 | ❌ 云端 | ✅ |
| 语义理解 | ✅ AST 级别 | ✅ | ✅ | ❌ 纯文本 |
| MCP 协议 | ✅ 原生 | ❌ | ❌ | ❌ |
| 跨语言追踪 | ✅ | 有限 | 有限 | ❌ |
| 免费开源 | ✅ MIT | 部分 | ❌ 付费 | ✅ |
| AI 工具集成 | 8+ 工具 | 有限 | 自有 | 无 |

CodeGraph 的核心差异在于：它是 **MCP 原生**的——不需要你在某个特定 IDE 或工具里使用，任何支持 MCP 的 AI 助手都能接入。

## 适合谁？

- ✅ **用 Claude Code / Cursor 的中大型项目开发者**——收益最大
- ✅ **多仓库/微服务架构团队**——跨项目索引能力
- ✅ **API 成本敏感的团队**——35% 的 token 节省非常可观
- ✅ **对代码隐私有要求的场景**——100% 本地，数据不出本机
- ⚠️ **小项目（< 50 文件）**——收益不明显，AI 直接扫描也很快
- ⚠️ **非主流语言项目**——tree-sitter 语法支持取决于语言社区

## 总结

CodeGraph 踩中了一个真实的痛点和正确的技术趋势：

- **痛点**：AI 编程助手的 token 浪费在「找代码」上
- **解法**：用知识图谱前置索引，把盲扫变成精查
- **趋势**：MCP 正在成为 AI 工具互联的标准协议

31K stars 的增速说明社区对这个方向的高度认可。如果你正在用 Claude Code 或 Cursor 做中大型项目的开发，花 5 分钟装个 CodeGraph，大概率会成为你今年投入产出比最高的开发工具决策。

> **GitHub**：https://github.com/colbymchenry/codegraph
> **官方文档**：https://colbymchenry.github.io/codegraph/
> **npm**：`@colbymchenry/codegraph`
