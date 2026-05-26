---
title: agent-skills：让 AI 编程助手像高级工程师一样工作的开源技能包
description: Addy Osmani 发布的开源项目 agent-skills，23 个生产级工程技能让 AI 编码助手遵循高级工程师的工作流程，已获 8600+ Star
duration: 6min
date: 2026-05-26
tags: [开源, AI, 开发工具, Claude Code, agent-skills]
---

## 这是什么

[agent-skills](https://github.com/addyosmani/agent-skills) 是 Addy Osmani（前 Google Chrome DevRel，现 Anthropic）开源的一套**生产级工程技能包**，专门给 AI 编程助手用的。

核心思路很简单：AI 编程助手默认走最短路径——能跳过测试就跳过，能不管安全就不管。agent-skills 把这套高级工程师的肌肉记忆打包成结构化工作流，**让 AI 强制走完标准工程流程**。

项目上线不到一个月，8600+ Star，在 2026 年 5 月的 GitHub Trending 周榜上持续霸榜。

## 它解决了什么问题

你用 AI 写代码时大概率遇到过这些情况：

- AI 写了一大坨代码，**一个测试都没有**
- API 设计没有边界校验，**连错误码都没定义**
- 代码能跑但**没人看得懂**，三个月后就是技术债
- 安全漏洞？AI 才不管 OWASP Top 10

Addy 自己说得直白：

> "AI coding agents skip those parts by default. Agent Skills is my attempt to make them **not optional**."

说白了，就是把 Google 内部的工程实践，做成 AI 能理解的规则文件。

## 技能全景：23 个技能 + 7 条斜杠命令

整个项目按开发生命周期分成 6 个阶段，覆盖从需求到上线的全流程：

### Meta — 元技能

| 技能 | 作用 |
|------|------|
| `using-agent-skills` | 根据你的需求自动识别该用哪个技能 |

### Define — 搞清楚到底要做什么

| 技能 | 一句话 |
|------|--------|
| `interview-me` | 一次一个问题，深挖你真正的需求，而不是你以为的需求 |
| `idea-refine` | 发散/收敛思维，把模糊想法变成具体方案 |
| `spec-driven-development` | 写 PRD：目标、命令、结构、代码风格、测试边界 |

### Plan — 拆解任务

| 技能 | 一句话 |
|------|--------|
| `planning-and-task-breakdown` | 把 spec 拆成可验证的小任务，带验收标准和依赖排序 |

### Build — 写代码

| 技能 | 一句话 |
|------|--------|
| `incremental-implementation` | 薄垂直切片：实现→测试→验证→提交，feature flag、安全默认值 |
| `test-driven-development` | 红-绿-重构，测试金字塔（80/15/5），Beyonce Rule |
| `context-engineering` | 在正确时间给 AI 喂正确信息：rules 文件、上下文打包、MCP 集成 |
| `source-driven-development` | 每个框架决策都基于官方文档，标注来源 |
| `doubt-driven-development` | 对抗性审查：声明→提取→质疑→调和→停止，高危场景必备 |
| `frontend-ui-engineering` | 组件架构、设计系统、状态管理、WCAG 2.1 AA 无障碍 |
| `api-and-interface-design` | 契约优先、Hyrum 定律、错误语义、边界校验 |

### Verify — 证明它真的能用

| 技能 | 一句话 |
|------|--------|
| `browser-testing-with-devtools` | Chrome DevTools MCP：DOM、console、网络、性能 |
| `debugging-and-error-recovery` | 五步排查：复现→定位→缩小→修复→防护 |

### Review — 合并前的质量门

| 技能 | 一句话 |
|------|--------|
| `code-review-and-quality` | 五轴审查、变更控制在 ~100 行、严重度标签（Nit/Optional/FYI） |
| `code-simplification` | Chesterton's Fence、Rule of 500，保持行为不变的前提下降低复杂度 |
| `security-and-hardening` | OWASP Top 10、认证模式、密钥管理、依赖审计 |
| `performance-optimization` | 先度量再优化：Core Web Vitals、profiling、bundle 分析 |

### Ship — 自信上线

| 技能 | 一句话 |
|------|--------|
| `git-workflow-and-versioning` | Trunk-based 开发、原子提交、~100 行变更原则 |
| `ci-cd-and-automation` | Shift Left、Faster is Safer、feature flag、质量门流水线 |
| `deprecation-and-migration` | 代码即负债、强制 vs 建议弃用、僵尸代码清理 |
| `documentation-and-adrs` | ADR（架构决策记录）、API 文档、解释"为什么" |
| `shipping-and-launch` | 上线前检查清单、灰度发布、回滚方案 |

### 7 条斜杠命令

这些是日常最常用的入口，一条命令自动激活对应的技能组合：

| 命令 | 做什么 | 核心原则 |
|------|--------|----------|
| `/spec` | 定义要构建什么 | 先写 spec，再写代码 |
| `/plan` | 规划如何构建 | 小而原子的任务 |
| `/build` | 增量式构建 | 一次一片 |
| `/test` | 证明它能用 | 测试即证据 |
| `/review` | 合并前审查 | 改善代码健康度 |
| `/code-simplify` | 简化代码 | 清晰优于聪明 |
| `/ship` | 上线部署 | 更快反而更安全 |

## 怎么用

### Claude Code（推荐）

最丝滑的方式是通过 marketplace 安装：

```bash
/plugin marketplace add addyosmani/agent-skills
/plugin install agent-skills@addy-agent-skills
```

如果 SSH 有问题，用 HTTPS：

```bash
/plugin marketplace add https://github.com/addyosmani/agent-skills.git
/plugin install agent-skills@addy-agent-skills
```

装完之后，直接在 Claude Code 里用斜杠命令就行。技能也会根据上下文自动激活——比如你在设计 API 时，`api-and-interface-design` 会自动触发。

### Cursor

把任意 `SKILL.md` 复制到 `.cursor/rules/` 目录下即可。也可以直接引用整个 `skills/` 目录。

### Gemini CLI

```bash
gemini skills install https://github.com/addyosmani/agent-skills.git --path skills
```

### 其他工具

支持 Windsurf、OpenCode、GitHub Copilot、Kiro IDE、Codex 等。技能文件本身就是纯 Markdown，理论上任何接受 system prompt 或指令文件的 AI 工具都能用。

## 技术细节

每个技能都是一个 `SKILL.md` 文件，结构统一：

- **目标（Goal）**：这个技能解决什么问题
- **触发条件（When to use）**：什么时候激活
- **步骤（Steps）**：结构化的执行流程
- **验证门（Verification gates）**：每一步怎么确认做对了
- **反合理化表（Anti-rationalization table）**：AI 常见的"偷懒借口"对照表

这个"反合理化表"是点睛之笔——AI 特别擅长给自己找借口，比如"这个改动太小了不需要测试"。anti-rationalization table 预先堵死了这些借口。

## 这个东西值不值得用

### 优点

- **覆盖面广**：从需求到上线，23 个技能覆盖完整 SDLC
- **多工具支持**：Claude Code、Cursor、Copilot、Gemini CLI 全兼容
- **实战导向**：来自 Google 工程实践，不是学术玩具
- **开源透明**：纯 Markdown，你可以直接看每个技能的内容，也可以 fork 定制
- **自动激活**：不用手动指定，AI 根据上下文自动匹配技能

### 可能的坑

- **增加 token 消耗**：每个 SKILL.md 都会占用上下文窗口，长会话成本更高
- **过度工程化风险**：写个小脚本也要走完整 spec→plan→build→test→review 流程，有点杀鸡用牛刀
- **学习曲线**：团队需要理解每个技能什么时候该用、什么时候可以跳过

## 适合谁用

- 用 AI 写**生产代码**的团队——这是 agent-skills 最精准的目标用户
- 个人开发者想做更规范的工程实践——跟着 SKILL.md 的流程走一遍，比看十篇最佳实践文章管用
- 对 AI 代码质量不放心的技术负责人——用它做 Code Review 前的第一道质量门

如果你只是偶尔让 AI 帮忙写个小脚本，那这东西可能有点重。但如果你把 AI 当正经开发工具用，**agent-skills 是目前最成熟的工程规范方案**。

## 相关链接

- GitHub: [github.com/addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
- 作者博客: [addyosmani.com/blog/agent-skills](https://addyosmani.com/blog/agent-skills/)
- DeepWiki: [deepwiki.com/addyosmani/agent-skills](https://deepwiki.com/addyosmani/agent-skills)
