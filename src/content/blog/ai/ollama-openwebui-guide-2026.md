---
title: Ollama + Open WebUI 本地大模型部署完全指南
description: 从零搭建属于你自己的私有 ChatGPT，Ollama 安装配置、模型推荐、Open WebUI 部署全流程，支持多用户、RAG、联网搜索
duration: 7min
date: 2026-05-31
tags: [AI, Ollama, Open WebUI, 本地部署, LLM, Docker]
---

数据隐私越来越受重视，把大模型跑在自己电脑上不再是极客专属。这篇教程带你从零搭建一个**完全本地的 ChatGPT 替代品**——用 Ollama 跑模型，用 Open WebUI 提供界面，数据 100% 留在你的机器上。

## 为什么选择本地部署？

| 场景 | 云端 API | 本地 Ollama |
|------|----------|-------------|
| 敏感数据处理 | ❌ 数据离开本地 | ✅ 完全离线 |
| 长期成本 | 💰 按 token 付费 | 🆓 免费（硬件折旧） |
| 低延迟 | 🌐 网络依赖 | ⚡ 本地推理 |
| 模型选择 | 🔒 平台限定 | 🎯 上千模型任选 |
| 自定义微调 | 🚫 受限 | ✅ 完全自由 |

如果你在写代码、处理客户数据、或者只是不想每月给 OpenAI 交钱，本地部署是性价比最高的选择。

## 第一步：安装 Ollama

Ollama 是目前最流行的本地模型运行工具，支持 macOS、Linux 和 Windows。

### macOS

```bash
# 直接下载安装
# https://ollama.com/download
# 或者用 Homebrew
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

从 [ollama.com/download](https://ollama.com/download) 下载 Windows 安装包，双击安装即可。

安装完成后，启动 Ollama 服务：

```bash
ollama serve
```

## 第二步：下载并运行模型

Ollama 的模型库非常丰富，这里推荐几个最实用的：

### 🥇 日常使用首选

```bash
# Qwen 3 —— 阿里最新开源模型，中文能力极强
ollama pull qwen3:14b        # 14B 参数，16GB 内存够用
ollama pull qwen3:32b        # 32B 参数，需要 24GB+ 内存

# DeepSeek V3 —— 性价比之王
ollama pull deepseek-r1:14b  # 推理能力出色，16GB 内存
ollama pull deepseek-r1:32b  # 更强推理，24GB+ 内存
```

### 🥈 编程专用

```bash
# DeepSeek Coder V2 —— 开源最强代码模型
ollama pull deepseek-coder-v2:16b

# CodeQwen —— 阿里代码模型
ollama pull codeqwen:7b
```

### 🥉 轻量级 / 低配置

```bash
# Llama 3.2 —— Meta 出品，3B 模型 8GB 内存就能跑
ollama pull llama3.2:3b

# Phi-4 —— 微软出品，小模型大智慧
ollama pull phi4:14b

# Gemma 3 —— Google 轻量模型
ollama pull gemma3:4b
```

### 💡 配置推荐

| 硬件配置 | 推荐模型 |
|----------|---------|
| 8GB 内存，无独显 | `llama3.2:3b`、`qwen3:4b` |
| 16GB 内存，8GB 显存 | `qwen3:14b`、`deepseek-r1:14b` |
| 32GB 内存，16GB 显存 | `qwen3:32b`、`deepseek-r1:32b` |
| 64GB+ 内存，24GB+ 显存 | `qwen3:72b`、`deepseek-r1:70b` |

跑起来试试：

```bash
ollama run qwen3:14b
```

你会进入一个交互式对话界面，直接输入问题就能得到回答。

## 第三步：部署 Open WebUI

命令行跑模型太原始了？Open WebUI 给你一个**媲美 ChatGPT 的网页界面**，支持多轮对话、Markdown 渲染、代码高亮、文件上传、RAG、联网搜索等功能。

### Docker 一键部署（推荐）

```bash
docker run -d \
  --name open-webui \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

打开浏览器访问 `http://localhost:3000`，注册一个管理员账号（第一个注册的用户自动成为管理员）。

Open WebUI 会自动检测本机运行的 Ollama 服务，你在 Ollama 中下载的模型会自动出现在模型列表中。

### 如果 Ollama 不在同一台机器

```bash
docker run -d \
  --name open-webui \
  -p 3000:8080 \
  -e OLLAMA_BASE_URL=http://192.168.1.100:11434 \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

把 `192.168.1.100` 换成你跑 Ollama 的机器 IP。

## 第四步：Open WebUI 进阶功能

### 🔗 联网搜索

Open WebUI 内置了 Web Search 功能。在「管理员面板 → 设置 → 联网搜索」中启用，支持以下搜索引擎：

- **SearXNG**（推荐，自建搜索引擎聚合）
- **Google PSE**
- **Brave Search**
- **Tavily**

推荐自建 SearXNG：

```bash
docker run -d \
  --name searxng \
  -p 8080:8080 \
  -v searxng:/etc/searxng \
  --restart always \
  searxng/searxng
```

然后在 Open WebUI 中填入 `http://localhost:8080` 即可。

### 📄 RAG 知识库

上传 PDF、Word、Markdown 文件到 Open WebUI，模型可以直接基于你的文档回答问题：

1. 点击「工作空间 → 知识库」
2. 上传文档，支持 PDF、DOCX、TXT、MD、CSV
3. 在对话中通过 `#` 引用知识库

这个功能非常实用，比如：
- 上传项目文档，让 AI 帮你查 API
- 上传合同，让 AI 帮你审阅
- 上传学习资料，让 AI 做你的私人助教

### 👥 多用户管理

Open WebUI 支持多用户系统，适合团队使用：

- 管理员面板 → 用户管理
- 可设置不同用户的模型访问权限
- 支持 LDAP/OAuth 集成

### 🎨 界面定制

Open WebUI 的界面高度可定制：

- **模型预设**：为不同场景设置不同的 System Prompt
- **主题**：支持自定义 CSS
- **插件系统**：社区有大量插件（Tools、Functions）

## 第五步：性能优化

### 量化级别选择

Ollama 默认使用 Q4_K_M 量化，你也可以指定：

```bash
# 查看模型可用量化版本
ollama show qwen3:14b

# 下载特定量化版本
ollama pull qwen3:14b-q8_0   # 更高精度，需要更多内存
ollama pull qwen3:14b-q2_K   # 更低精度，更省内存
```

### GPU 加速

Ollama 默认会自动使用 NVIDIA GPU（CUDA）和 Apple Silicon GPU（Metal）。

确认 GPU 是否被使用：

```bash
# 运行时查看日志
ollama run qwen3:14b --verbose
```

输出中会显示 GPU 层数。如果显示 `100% GPU`，说明所有层都在 GPU 上运行。

### 并发请求

Ollama 默认支持并发请求，可通过环境变量调整：

```bash
# 设置并发数
export OLLAMA_NUM_PARALLEL=4

# 设置最大加载模型数
export OLLAMA_MAX_LOADED_MODELS=2
```

## 实际效果对比

我在自己的 M2 Max MacBook Pro（32GB）上测试：

| 模型 | 内存占用 | 生成速度 | 中文质量 |
|------|---------|---------|---------|
| qwen3:14b | ~10GB | ~35 tok/s | ⭐⭐⭐⭐⭐ |
| qwen3:32b | ~22GB | ~18 tok/s | ⭐⭐⭐⭐⭐ |
| deepseek-r1:14b | ~10GB | ~30 tok/s | ⭐⭐⭐⭐ |
| llama3.2:3b | ~3GB | ~60 tok/s | ⭐⭐⭐ |

qwen3 系列的中文能力确实惊艳，14B 的模型在大多数日常任务上已经不输 GPT-4o。

## 总结

| 组件 | 作用 | 替代什么 |
|------|------|---------|
| Ollama | 运行模型 | OpenAI API |
| Open WebUI | 聊天界面 | ChatGPT UI |
| SearXNG | 联网搜索 | Bing/ChatGPT Browse |
| RAG 知识库 | 文档问答 | ChatGPT 文件上传 |

三者组合，你就有了一套**完全本地、数据私有、功能齐全的 AI 助手系统**。总成本 = 你的电脑硬件 + 0 元月费。

### 常见问题

**Q：Windows 能用吗？**  
A：完全可以。Ollama 有原生 Windows 版，Open WebUI 通过 Docker Desktop 运行。

**Q：没有 NVIDIA 显卡能跑吗？**  
A：能。CPU 推理也能用，7B 以下模型体验尚可，14B 模型会比较慢。

**Q：能接入 API 吗？**  
A：Ollama 自带 OpenAI 兼容 API（`http://localhost:11434/v1`），可以直接对接 ChatBox、Continue、Cursor 等工具。

**Q：和 LM Studio 比怎么样？**  
A：LM Studio 更适合单个用户在桌面使用，Ollama + Open WebUI 更适合部署为团队服务。Ollama 的 API 兼容性也更好。

---

开始你的本地 AI 之旅吧。有问题欢迎在评论区交流 🚀
