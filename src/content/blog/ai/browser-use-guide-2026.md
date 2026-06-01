---
title: Browser Use — 91K Star 的 AI 浏览器自动化神器，开源替代 Operator 的最佳选择
description: Browser Use 是 GitHub 增长最快的 AI Agent 项目，91K+ Stars，89.1% WebVoyager 成功率。本文从安装到实战，带你彻底搞懂这个让 AI 控制浏览器的开源框架。
duration: 7min
date: 2026-06-01
tags: [AI, Browser Use, AI Agent, 浏览器自动化, 开源]
---

2026 年，AI Agent 不再只是聊聊天、写写代码——它们开始**操作你的浏览器**了。

OpenAI 推出了 Operator，Anthropic 搞了 Computer Use，Google 有 Project Mariner。但这些商业方案要么贵得离谱，要么绑死生态。有没有一个开源、免费、还能打得过它们的方案？答案就是 **Browser Use**。

## Browser Use 是什么？

[Browser Use](https://github.com/browser-use/browser-use) 是一个基于 Python 的开源框架，让 AI 能像人一样操作浏览器——打开网页、点击按钮、填写表单、提取数据，全自动完成。

它的核心思路很简单：**把浏览器的 DOM 树和可访问性树喂给 LLM，让模型理解网页结构，再通过 Playwright 执行操作**。

几个关键数据能说明它有多火：

| 指标 | 数据 |
|------|------|
| GitHub Stars | **91K+** |
| WebVoyager 基准测试 | **89.1%** 成功率（行业平均 35.8%） |
| 种子轮融资 | **$17M**（Felicis 领投） |
| 定位 | 2025/2026 增长最快的 AI Agent 项目 |

> 甚至 Manus 这种爆款 AI 应用，底层用的也是 Browser Use——它本身不是竞争者，而是基础设施。

## 三大浏览器 Agent 横评

市面上主流的 AI 浏览器控制方案就三个：

| | Browser Use | OpenAI Operator | Claude Computer Use |
|------|------|------|------|
| **开源** | ✅ 完全开源 | ❌ 闭源 | ❌ 闭源 |
| **价格** | 免费（只付 API 费用） | $200/月 Pro 订阅 | 按 token 计费 |
| **实现方式** | DOM 树 + 视觉混合 | 视觉为主 | 截图 + 坐标 |
| **速度** | 3-5 倍快于纯视觉方案 | 中等 | 较慢 |
| **精确度** | 高（直接操作 DOM 元素） | 中 | 中 |
| **反检测** | 好（Playwright stealth） | 一般 | 一般 |
| **自定义** | 无限 | 受限 | 受限 |

简单总结：**Browser Use 在速度、成本和灵活性上全面碾压商业方案**。

核心差距来自技术路线——Browser Use 不是截个图让 AI "看图猜按钮"，而是直接解析 DOM / 可访问性树，告诉 LLM 每个元素的语义信息。这让它比纯视觉方案快 3-5 倍，而且不会出现"点歪了"的尴尬。

## 5 分钟快速上手

### 第一步：安装

```bash
# 推荐用 uv（更快），当然 pip 也行
pip install browser-use

# 安装 Playwright 浏览器
playwright install chromium
```

### 第二步：设置 API Key

```bash
export OPENAI_API_KEY="sk-xxxx"
# 或者用 Anthropic
export ANTHROPIC_API_KEY="sk-ant-xxxx"
```

Browser Use 支持几乎所有主流 LLM：OpenAI、Anthropic、DeepSeek、Ollama 本地模型等。想省钱的话，接 DeepSeek V3 效果也不差。

### 第三步：跑起来

最小示例——让 AI 帮你搜机票：

```python
from browser_use import Agent
from langchain_openai import ChatOpenAI

agent = Agent(
    task="去携程搜一下 6 月 5 日上海到北京的机票，找出最便宜的三班",
    llm=ChatOpenAI(model="gpt-4o"),
)

result = await agent.run()
print(result)
```

就这么几行，AI 会自动打开浏览器、导航到携程、输入日期、提取结果、返回给你。

## 实战场景

### 场景一：自动填表单

重复填表是 Browser Use 最擅长的。比如批量注册账号、提交报销单、填问卷——把任务描述丢进去，它自己搞定。

```python
agent = Agent(
    task="""
    打开 https://example.com/register
    填写以下信息：
    - 用户名：testuser2026
    - 邮箱：test@example.com
    - 密码：用建议的强密码
    提交表单，确认注册成功
    """,
    llm=ChatOpenAI(model="gpt-4o"),
)
await agent.run()
```

### 场景二：数据采集 & 监控

传统爬虫需要写 XPath/CSS Selector，遇到反爬就傻眼。Browser Use 用自然语言描述需求，AI 自己找元素、处理动态加载。

```python
agent = Agent(
    task="""
    1. 打开 GitHub Trending 页面
    2. 收集前 10 个项目名称、stars、描述
    3. 输出为 JSON
    """,
    llm=ChatOpenAI(model="gpt-4o"),
)
await agent.run()
```

### 场景三：多步骤业务流程

这是 Browser Use 真正的杀手锏——复杂业务流程自动化，比如：

- 从邮件里提取订单号 → 登录物流平台 → 查状态 → 发通知
- 登录多个平台抓取竞品价格 → 汇总对比 → 生成表格
- 定时检查某个页面变化 → 截图 → 推送提醒

**一个 task 可以包含几十步操作**，Browser Use 会自动拆解、执行、遇到错误还会重试。

## 进阶配置

### 用本地模型省钱

```python
from browser_use import Agent
from langchain_ollama import ChatOllama

agent = Agent(
    task="打开百度搜索'今天天气'",
    llm=ChatOllama(model="qwen3:14b"),  # 14B 模型足够日常使用
)
await agent.run()
```

本地跑 Qwen3 14B 效果也不错，成本为零。复杂任务还是建议用 GPT-4o 或 Claude。

### 反检测 & Stealth 模式

```python
agent = Agent(
    task="...",
    llm=ChatOpenAI(model="gpt-4o"),
    use_vision=False,          # 关掉视觉，纯 DOM 模式更快
    stealth_mode=True,         # 反检测模式
    headless=False,            # 要不要看浏览器界面
)
```

Stealth 模式会注入反指纹脚本，绕过大部分网站的机器人检测——实测比 Selenium + undetected-chromedriver 效果更好。

### 持久化 Session

```python
agent = Agent(
    task="登录 Gmail 并检查未读邮件",
    llm=ChatOpenAI(model="gpt-4o"),
    keep_open=True,            # 任务结束后保持浏览器打开
    save_conversation_path="logs/gmail_session.json",  # 保存会话
)
```

## 局限和踩坑

说实话，Browser Use 不是万能药。几个实际使用中的坑：

1. **验证码无解**：遇到 CAPTCHA 会卡住，建议配合 2captcha 或在任务里加入"遇到验证码通知人工"
2. **Token 消耗不小**：复杂页面 DOM 很大，一次操作可能消耗几千 token，建议用 DeepSeek 等性价比模型
3. **动态页面偶尔翻车**：SPA 应用如果 DOM 变化太快，Agent 可能找不到元素
4. **需要稳定网络**：Playwright 依赖 Chromium 下载，国内最好配镜像

## 什么时候该用 Browser Use？

| 场景 | 适合度 |
|------|------|
| 重复填表、提交操作 | ⭐⭐⭐⭐⭐ |
| 多步骤业务流程 | ⭐⭐⭐⭐⭐ |
| 竞品数据采集 | ⭐⭐⭐⭐ |
| 网页端到端测试 | ⭐⭐⭐⭐ |
| 单次临时操作 | ⭐⭐（不如手动） |
| 验证码密集型 | ⭐（不行） |

## 总结

Browser Use 是 2026 年最值得关注的 AI 开源项目之一。91K Star 不是刷出来的——它是真真切切解决了"让 AI 操作网页"这个问题，而且比 OpenAI 和 Anthropic 的商业方案更快、更准、更便宜。

三个字总结：**用就完了**。

> **推荐链接**
> - GitHub: [browser-use/browser-use](https://github.com/browser-use/browser-use)
> - 官方文档: [docs.browser-use.com](https://docs.browser-use.com)
> - 竞争分析: [aimultiple.com/open-source-web-agents](https://aimultiple.com/open-source-web-agents)