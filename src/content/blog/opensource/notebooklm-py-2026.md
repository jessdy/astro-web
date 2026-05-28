---
title: "notebooklm-py：把 Google NotebookLM 变成你的 AI 工具箱"
description: "15K+ Star 开源项目深度评测：用 Python/CLI/AI Agent 解锁 NotebookLM 的全部潜力，包括 Web UI 隐藏的批量下载、幻灯片 PPTX 导出、Quiz JSON 提取等功能"
duration: 7min
date: 2026-05-28
tags: [开源, AI工具, NotebookLM, Python, Agent]
---

Google NotebookLM 是过去一年最有意思的 AI 产品之一——上传文档，AI 帮你做研究、生成播客、出测验题。但它的 Web UI 有一堆限制：不能批量下载、不能导出 PPTX、不能把 Quiz 转成 JSON……

[notebooklm-py](https://github.com/teng-lin/notebooklm-py) 就是来解决这些痛点的。这是一个非官方的 Python API，15K+ GitHub Stars，它把 NotebookLM 变成了一个可以**程序化操作、命令行调用、AI Agent 集成的全功能工具箱**。

## 这是什么？

一句话：**通过代码操控 NotebookLM 的一切。**

```bash
pip install "notebooklm-py[browser]"
notebooklm login
notebooklm create "我的研究项目"
notebooklm source add "https://arxiv.org/abs/2401.xxxxx"
notebooklm ask "这篇论文的核心贡献是什么？"
notebooklm generate audio "做个深度解析" --wait
notebooklm download audio ./podcast.mp3
```

不需要打开浏览器，不需要点来点去。一条命令就能完成从「创建笔记本 → 导入资料 → 提问 → 生成播客 → 下载 MP3」的全流程。

项目支持三种使用方式，覆盖不同场景：

| 方式 | 适用场景 |
|------|---------|
| **Python API** | 应用集成、异步工作流、自定义流水线 |
| **CLI** | Shell 脚本、CI/CD、快速任务 |
| **Agent 集成** | Claude Code / Codex / OpenClaw，自然语言驱动 |

## 核心能力清单

### 完整的内容生成矩阵

notebooklm-py 覆盖了 NotebookLM 目前能生成的**所有**内容类型，参数控制比 Web UI 更灵活：

| 类型 | 格式选项 | 下载格式 |
|------|---------|----------|
| **Audio Overview** | 4 种格式（深度解析/简报/批判/辩论），3 种长度，50+ 语言 | MP3 / MP4 |
| **Video Overview** | 3 种格式（讲解/简报/电影感），9 种视觉风格 | MP4 |
| **Slide Deck** | 详细版/演讲者版，可调节长度，**支持逐页修改** | PDF / **PPTX** |
| **Infographic** | 3 种方向，3 种细节等级 | PNG |
| **Quiz** | 可配置数量和难度 | **JSON / Markdown / HTML** |
| **Flashcards** | 可配置数量和难度 | **JSON / Markdown / HTML** |
| **Report** | 简报/学习指南/博客文章/自定义 Prompt | Markdown |
| **Data Table** | 用自然语言定义结构 | **CSV** |
| **Mind Map** | 交互式层级可视化 | **JSON** |

### AI Agent 就绪

项目内置了完整的 Agent Skill 定义，直接对接主流 AI 编程助手：

- **Claude Code**：自带 `SKILL.md`，支持 `npx skills add` 发现
- **Codex（OpenAI）**：提供 `AGENTS.md` 仓库级指引
- **OpenClaw**：原生集成
- 本地安装：`notebooklm skill install`

这意味着你可以对 Claude Code 说「帮我用 NotebookLM 分析这三篇论文，生成一个播客，然后下载下来」，Agent 会自动调用 notebooklm-py 完成全流程。

### 研究自动化

```bash
# Web 研究 + 自动导入来源
notebooklm source add-research "量子计算最新进展"

# 批量导入多种格式
notebooklm source add "https://example.com/article"
notebooklm source add "./paper.pdf"
notebooklm source add "https://youtube.com/watch?v=xxxxx"
notebooklm source add --drive "folder_id_here"
```

Research Agent 支持 fast 和 deep 两种模式，适合不同深度的资料搜集需求。

## 超越 Web UI：这些功能只有 API 才有

这可能是 notebooklm-py 最核心的价值——**它暴露了 Web UI 里没有的能力**：

1. **批量下载**：一键下载某个类型的全部生成物
2. **Quiz / Flashcards 结构化导出**：JSON / Markdown / HTML，Web UI 只能在线交互
3. **Slide Deck 导出 PPTX**：Web UI 只给 PDF，API 给可编辑的 PowerPoint
4. **逐页修改幻灯片**：用自然语言 Prompt 改单页
5. **Mind Map JSON 导出**：拿去给可视化工具二次加工
6. **Data Table CSV 导出**：结构化表格直接进 Excel
7. **Report 模板定制**：在内置模板基础上追加自定义指令
8. **Source Fulltext 访问**：获取任意来源的索引全文
9. **多账户 Profile**：切换 Google 账户不用重新登录
10. **浏览器 Cookie 导入**：复用已有浏览器会话，省去 Playwright 登录

对于需要把 NotebookLM 输出接入下游 workflow 的场景，这 10 个能力基本覆盖了所有痛点。

## 快速上手

### 安装（推荐方式）

```bash
pip install "notebooklm-py[browser]"   # 核心 + Playwright
playwright install chromium             # ~170MB，耐心等 30-90 秒
notebooklm login                        # 打开浏览器进行 Google 登录
notebooklm auth check --test --json     # 验证：期望 "status": "ok"
```

### 作为库嵌入应用

```bash
pip install notebooklm-py               # ~10MB，无需 Playwright/Chromium
# 需要预先提供 storage_state.json
```

### Python API 示例

```python
import asyncio
from notebooklm import NotebookLM

async def main():
    nlm = NotebookLM()

    # 创建笔记本
    notebook = await nlm.notebooks.create("产品调研")

    # 批量导入来源
    await nlm.sources.add(notebook["id"], "https://competitor.com/product")
    await nlm.sources.add(notebook["id"], "./market_report.pdf")

    # 提问
    answer = await nlm.chat.ask(notebook["id"], "竞品的核心差异化优势是什么？")
    print(answer["text"])

    # 生成播客并下载
    audio = await nlm.generate.audio(notebook["id"], prompt="深度解析市场格局")
    await nlm.download.audio(audio["id"], "./market_podcast.mp3")

asyncio.run(main())
```

### CLI 精华命令速查

```bash
# 多账户管理
notebooklm profile list                 # 列出所有 Google 账户
notebooklm profile switch work          # 切换账户

# 登录方式
notebooklm login --browser msedge       # 用 Edge（企业 SSO 场景）
notebooklm login --browser-cookies chrome  # 复用 Chrome 已有会话

# 生成内容
notebooklm generate video --style whiteboard --wait
notebooklm generate cinematic-video "纪录片风格总结" --wait
notebooklm generate quiz --difficulty hard
notebooklm generate slide-deck
notebooklm generate mind-map

# 下载
notebooklm download quiz --format markdown ./quiz.md
notebooklm download slide-deck ./slides.pptx   # 只有 API 能导出 PPTX！
notebooklm download mind-map ./mindmap.json

# Agent 相关
notebooklm agent show claude            # 打印 Claude Code Skill 模板
notebooklm skill status                 # 检查本地 Agent Skill 安装状态
```

## 实际应用场景

### 场景一：个人研究者

你正在读一批论文，想快速了解全貌：

```bash
notebooklm create "论文调研-LLM记忆机制"
notebooklm source add ./paper1.pdf ./paper2.pdf ./paper3.pdf
notebooklm generate audio "对比分析这三篇论文的方法论" --wait
notebooklm download audio ./lit_review.mp3
```

通勤路上听完，到办公室再看 PDF。

### 场景二：内容创作者

把长文转成多格式内容：

```bash
notebooklm create "本周AI动态"
notebooklm source add-research "2026年5月AI领域重大新闻" --mode deep
notebooklm generate report --type blog-post
notebooklm generate infographic --orientation landscape
notebooklm download report ./weekly_news.md
notebooklm download infographic ./weekly_news.png
```

一篇博客 + 一张信息图，一小时内搞定。

### 场景三：AI Agent 自动化

在 Claude Code 里装好 Skill，然后：

> 「把这 5 篇技术文档导入 NotebookLM，生成一份对比报告，再做一个 5 分钟的播客，全部下载到 ~/research/ 目录」

Agent 自动调用 notebooklm-py，你只需等结果。

### 场景四：CI/CD 内容流水线

```yaml
# GitHub Actions 示例片段
- name: Generate weekly digest
  run: |
    notebooklm use $NOTEBOOK_ID
    notebooklm generate report --type briefing-doc
    notebooklm download report ./weekly_briefing.md
```

## 注意事项

⚠️ **这是非官方库**，使用了 Google 未公开的内部 API。几个需要注意的点：

- **API 可能随时变更**：Google 改内部接口不需要通知任何人
- **有速率限制**：大量使用可能被限流
- **不适合生产关键场景**：建议用于原型、研究、个人项目
- **与 Google 无关**：纯社区项目，出了问题别找 Google

但从项目维护情况看——2 个 Open Issue、今天还在更新——作者 teng-lin 的响应速度相当靠谱。

## 总结

notebooklm-py 把一个已经很强大的 AI 工具变成了可以嵌入任何 workflow 的组件。无论你是：
- 想做自动化研究的独立开发者
- 需要批处理内容的创作者
- 在搭 Agent 流水线的 AI 工程师

这个项目都值得放进你的工具箱。

**15K Stars、MIT 协议、活跃维护**——还有什么理由不试一下？

---

> **项目地址**：[github.com/teng-lin/notebooklm-py](https://github.com/teng-lin/notebooklm-py)
> **PyPI**：`pip install notebooklm-py`
