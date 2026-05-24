---
title: antirez/ds4：Redis 之父出手，Mac 本地跑 DeepSeek V4 推理引擎，8K Star 炸裂开源
description: Salvatore Sanfilippo（antirez）最新开源项目 ds4.c，一个专门为 DeepSeek V4 Flash 打造的 Metal 本地推理引擎，468 token/s，3 行命令在你的 MacBook 上跑 284B MoE 模型
duration: 6min
date: 2026-05-24
tags: [开源, AI, DeepSeek, Mac, antirez]
---

## 一句话总结

**Redis 之父 antirez 又出山了。**这次不是数据库，是一个用 C 写的、专门在你 Mac 上跑 DeepSeek V4 的推理引擎 — ds4.c。

---

## 这项目是什么？

简单说：**让你在自己 MacBook 上本地运行 DeepSeek V4 Flash（284B MoE 模型），不需要云服务，数据不出本机。**

它不是通用推理框架（不是 Ollama、不是 llama.cpp），而是**一个模型一个引擎**的极致优化方案。

> "One Model, One Framework" — antirez

实测数据：M4 Max 上跑到 **468 token/s**。

---

## 为什么炸裂？

### 1. 作者光环

Salvatore Sanfilippo，aka **antirez**，Redis 的创造者。2019 年退出 Redis 核心开发后，他转型写 AI 推理引擎。上一个作品是 llama.cpp 的竞品（后来合并进了 llama.cpp），这次 ds4 是他对「极致优化」理念的又一次实践。

### 2. 技术上的狠活

| 特性 | 说明 |
|------|------|
| 语言 | 纯 C（无依赖，无 Python 运行时） |
| 后端 | Metal only（Apple Silicon 专属） |
| 模型 | 仅 DeepSeek V4 Flash（284B MoE） |
| 量化 | 4-bit 量化，Mac 内存可跑 |
| API | 兼容 OpenAI / Anthropic HTTP API |
| 性能 | M4 Max 上 468 tok/s |

核心思路：**不做通用框架，只为 DS4 这一个模型做到极致。** 这意味着：
- MoE 专家路由硬编码（不需要通用分发逻辑）
- KV Cache 针对 DS4 注意力头优化
- Metal 预填充块大小针对 M 系列 GPU 调参

### 3. 3 行命令跑起来

```bash
git clone https://github.com/antirez/ds4
cd ds4
make && ./ds4 --model /path/to/ds4-flash.gguf
```

然后 `curl http://localhost:8080/v1/chat/completions` 直接调 —— **兼容 OpenAI API 格式**，无缝替换任何调用 OpenAI 的客户端。

---

## 跟 Ollama、llama.cpp 比？

| | ds4 | Ollama | llama.cpp |
|------|-----|--------|-----------|
| 定位 | DS4 专属引擎 | 通用模型运行器 | 通用推理后端 |
| 模型支持 | 仅 DS4 | 数百个 | 数百个 |
| DS4 性能 | ⚡ 最快 | 🐢 一般 | 🐢 一般 |
| 内存占用 | 更低 | 较高 | 较高 |
| API 兼容 | OpenAI 格式 | OpenAI 格式 | 需自行封装 |

**如果你只想在 Mac 上跑 DeepSeek V4，ds4 是目前最好的选择。**

---

## 为什么值得关注？

1. **本地推理趋势**：越来越多人不愿意把数据交给云端 AI。苹果全家桶用户用 Mac 本地跑大模型是刚需
2. **专有优化 > 通用框架**：这是一条反直觉但正确的路。与其做一个「什么都能跑」的框架，不如为一个模型做到极致
3. **antirez 出品**：他写代码的风格追求简洁和性能，阅读 ds4.c 源码本身就是学习系统编程的好材料

---

## 硬件要求

| 设备 | 内存 | 可行？ |
|------|------|--------|
| M1 8GB | 8GB | ❌ 不够 |
| M2/M3 16GB | 16GB | ⚠️ 勉强（4-bit 量化后 ~20GB） |
| M2/M3 24GB+ | 24GB+ | ✅ 可跑 |
| M4 Max 36GB+ | 36GB+ | ✅ 流畅（468 tok/s） |

**建议至少 24GB 统一内存**，否则 OOM。

---

## 总结

antirez 又一次证明：**高手在民间，好代码在 GitHub。**

不需要订阅费，不需要 API Key，不需要担心隐私 —— 一台 MacBook，一个 C 文件，跑起 284B 的 MoE 模型。

> GitHub：https://github.com/antirez/ds4
> Star 数：8,056+（截至 2026-05-24）

趁现在还热乎，赶紧 Star+Clone，跟上这支「一个模型一个引擎」的新潮流。
