---
title: CloakBrowser：一款真正隐身的开源浏览器，30/30 绕过所有反爬检测
description: 源码级 Chromium 指纹修改，免费替代市面上 $49-299/月的反检测浏览器。Playwright 无缝替换，3 行代码搞定
duration: 5min
date: 2026-05-24
tags: [开源, 爬虫, 浏览器, 隐私, Playwright]
---

# CloakBrowser：一款真正隐身的开源浏览器

反检测浏览器（Antidetect Browser）这个赛道，市面上的产品基本都要收费——从 $49/月 到 $299/月 不等。原理也不复杂，大多是在 Chromium 上套一层 JS 注入来修改指纹。

**CloakBrowser 走了完全不同的路：直接从 C++ 源码层修改 Chromium。**

结果就是——30 个主流反爬检测全部通过，包括 Cloudflare Turnstile、DataDome、PerimeterX。而且**完全开源免费**。

---

## 它做了什么？

传统反检测浏览器的做法：启动 Chromium → 注入 JavaScript → 拦截指纹读取 API → 返回假数据。

这种做法有两个致命缺陷：
1. **注入时机太晚**——页面 JS 可能在你的 patch 之前就读取了指纹
2. **CDP（Chrome DevTools Protocol）痕迹**——自动化工具的控制信号无法完全隐藏

CloakBrowser 的做法：**在编译前直接修改 Chromium C++ 源码。**

```
传统方案：Chromium 启动 → JS 注入 → 拦截指纹 API
                                    ↑ 页面可能已经读到了

CloakBrowser：修改 C++ 源码 → 编译 → 指纹已内置修改
                                    ↑ 检测工具看到的就是"正常浏览器"
```

具体修改了 58 个 C++ 补丁，覆盖：

| 指纹维度 | 修改内容 |
|----------|---------|
| Canvas | 渲染结果随机噪声注入 |
| WebGL | GPU 型号、驱动信息替换 |
| AudioContext | 音频指纹差异化 |
| 字体列表 | 动态字体枚举混淆 |
| WebRTC | 真实 IP 泄露防护 |
| CDP | 自动化控制信号消除 |
| 鼠标轨迹 | `humanize=True` 模拟人类操作 |

---

## 3 行代码上手

Python 用法——和 Playwright 完全一样的 API：

```python
# 安装
# pip install cloakbrowser playwright
# cloakbrowser install

from cloakbrowser import launch

browser = launch(headless=False, humanize=True)
page = browser.new_page()
page.goto("https://example.com")
```

JavaScript 端也支持 Puppeteer 的无缝替换：

```javascript
// 把 'puppeteer' 换成 'cloakbrowser'
const { launch } = require('cloakbrowser');

const browser = await launch({ headless: false, humanize: true });
const page = await browser.new_page();
await page.goto('https://example.com');
```

核心就一个参数：`humanize=True`。开启后会自动模拟人类鼠标移动轨迹、随机延迟、滚动行为。

---

## 实战：绕过 Cloudflare Turnstile

CloakBrowser 在 Cloudflare Turnstile 测试中通过了全部 3 项（headed 模式，macOS）。这意味着你可以直接自动化访问被 Cloudflare 保护的网站，不需要手动过验证码。

```python
from cloakbrowser import launch

browser = launch(headless=False, humanize=True)
page = browser.new_page()

# 直接访问 Cloudflare 保护的网站
page.goto("https://protected-site.com")

# 无需手动过验证码，正常操作即可
page.click("button.login")
page.fill("input[name='email']", "user@example.com")
```

对于需要长期运行的爬虫任务，还可以启用持久化 Profile：

```python
browser = launch(
    headless=False,
    humanize=True,
    profile_dir="./profiles/site-a",  # 持久化存储
)
```

这样每次启动都带着相同的浏览器指纹和 Cookie，不会因为频繁切换指纹而被风控系统标记。

---

## 和收费方案的对比

| 方案 | 原理 | 月费 | 开源 |
|------|------|------|:--:|
| CloakBrowser | C++ 源码级修改 | 免费 | ✅ |
| Multilogin | JS 注入 + 代理 | $99 | ❌ |
| GoLogin | JS 注入 | $49 | ❌ |
| AdsPower | JS 注入 | $59 | ❌ |
| Dolphin{anty} | JS 注入 | $89 | ❌ |

CloakBrowser 不仅是免费的，技术路线也从根本上比 JS 注入方案更可靠。检测工具看到的就是一个**真实编译出来的 Chromium 浏览器**，只不过指纹被源码级修改过。

---

## 限制和注意事项

1. **仅限自动化场景**——这不是一个日常使用的浏览器，没有书签栏、插件系统等常规功能。它是给爬虫和自动化用的。
2. **需要编译环境**——如果你需要自定义指纹参数，需要自行编译 Chromium（官方提供预编译二进制）
3. **headless 模式受限**——部分检测（如 Turnstile）在 headless 模式下仍会失败，推荐 `headless=False`
4. **合法使用**——请遵守目标网站的 robots.txt 和服务条款

---

## 总结

CloakBrowser 是 2026 年开源爬虫领域最值得关注的项目。它把反检测浏览器的技术门槛从"付费订阅"拉到了"开源免费"，而且技术方案更底层、更可靠。

如果你在做 web scraping、自动化测试、数据采集，这个项目值得第一时间 star。

- **GitHub**：[CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser)
- **官网**：[cloakbrowser.dev](https://cloakbrowser.dev)
- **Stars**：快速增长中（2026年5月）

---

> **下期预告**：MCP Server 搭建实战——30 分钟写一个你自己的 Agent 工具。
