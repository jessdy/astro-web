---
title: MCP 协议入门与实战：让 AI 真正「动手」干活
description: Model Context Protocol（MCP）是 Anthropic 提出的开放协议，让 AI 模型能安全地访问外部工具和数据。本文从零讲解 MCP 的概念、架构，并带你搭建第一个 MCP Server。
duration: 8min
date: 2026-05-26
tags: [MCP, AI Agent, Claude, 工具调用, 协议]
---

## 为什么要关注 MCP？

2026 年了，AI 能聊天已经不算什么新鲜事。真正拉开差距的，是 AI 能不能「动手」——能不能读你的文件、查你的数据库、调你的 API。

这就是 MCP（Model Context Protocol）要解决的问题。

MCP 是 Anthropic 在 2024 年底推出的开放协议，本质上是一个标准化的「AI 连接器」——它定义了一套统一的接口，让任何 AI 模型都能安全、可控地访问外部工具和数据源。

你可以把它理解成 AI 世界的 **USB-C 协议**：以前每个工具都要单独写集成代码，现在只要你的工具支持 MCP，AI 就能即插即用。

## MCP 的架构：三个角色

MCP 的架构非常简洁，只有三个角色：

```
┌──────────┐     MCP Protocol     ┌──────────┐
│          │ ◄──────────────────► │          │
│  MCP     │                      │  MCP     │
│  Host    │                      │  Server  │
│          │                      │          │
│ (Claude  │                      │ (你的工具) │
│  Desktop)│                      │          │
└──────────┘                      └──────────┘
      │                                  │
      │         MCP Protocol             │
      └──────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │   MCP       │
              │   Client    │
              │ (SDK/库)    │
              └─────────────┘
```

| 角色 | 说明 | 例子 |
|------|------|------|
| **MCP Host** | 运行 AI 模型的应用 | Claude Desktop、VS Code、Cursor |
| **MCP Client** | 与 MCP Server 通信的客户端库 | `@anthropic-ai/mcp-client` |
| **MCP Server** | 提供具体工具/资源的服务 | 文件系统、数据库、天气 API |

核心流程：
1. Host 启动时加载配置的 MCP Server
2. Server 向 Host 声明自己有哪些「工具」（Tools）和「资源」（Resources）
3. 用户提问，AI 判断需要调用哪个工具
4. Host 通过 MCP Client 向 Server 发起调用
5. Server 执行操作、返回结果给 AI 继续推理

## MCP 支持的三种能力

MCP Server 可以暴露三种类型的能力：

### 1. Tools（工具）
AI 可以主动调用的函数。比如读取文件、查询数据库、发送 HTTP 请求。

```json
{
  "name": "read_file",
  "description": "读取指定路径的文件内容",
  "inputSchema": {
    "type": "object",
    "properties": {
      "path": { "type": "string" }
    }
  }
}
```

### 2. Resources（资源）
Server 暴露的静态或动态数据。AI 可以像读取文件一样获取这些数据。

```json
{
  "uri": "file:///home/user/config.json",
  "name": "应用配置",
  "mimeType": "application/json"
}
```

### 3. Prompts（提示词模板）
预定义的提示词，方便用户快速调用常见任务。

```json
{
  "name": "code_review",
  "description": "对代码进行审查",
  "arguments": [
    { "name": "language", "required": true }
  ]
}
```

## 实战：写一个天气查询 MCP Server

理论说完了，来写代码。我们用 Python SDK 快速搭建一个天气查询的 MCP Server。

> 完整代码已开源，参考 [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)。

### Step 1：安装依赖

```bash
pip install mcp httpx
```

### Step 2：编写 Server

```python
# weather_server.py
import json
import httpx
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationCapabilities
from mcp.server.stdio import stdio_server

# 创建 MCP Server 实例
server = Server("weather-server")

@server.list_tools()
async def list_tools():
    """声明 Server 提供的工具列表"""
    return [
        {
            "name": "get_weather",
            "description": "查询指定城市的当前天气",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，例如 Beijing"
                    }
                },
                "required": ["city"]
            }
        }
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    """处理工具调用"""
    if name == "get_weather":
        city = arguments["city"]
        # 调用免费天气 API
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://wttr.in/{city}?format=j1",
                timeout=10.0
            )
            data = resp.json()
            current = data["current_condition"][0]
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"""🌍 {city} 当前天气：
🌡 温度：{current['temp_C']}°C
💧 湿度：{current['humidity']}%
🌬 风速：{current['windspeedKmph']} km/h
📝 描述：{current['weatherDesc'][0]['value']}"""
                    }
                ]
            }
    
    raise ValueError(f"未知工具: {name}")

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationCapabilities(
                sampling={},
                experimental={},
            ),
        )

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Step 3：配置 Claude Desktop

在 Claude Desktop 的配置文件中添加你的 MCP Server：

```json
// macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
// Windows: %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["/path/to/weather_server.py"]
    }
  }
}
```

重启 Claude Desktop，然后试试问：「北京今天天气怎么样？」

Claude 会自动识别并调用你的 weather MCP Server，返回实时天气数据。

## 进阶：MCP + 数据库 = 智能数据分析

更有意思的玩法是把 MCP 接到数据库。下面是一个查询 SQLite 的 MCP Server 示例：

```python
# db_server.py
import sqlite3
from mcp.server import Server
from mcp.server.stdio import stdio_server

server = Server("sqlite-server")
DB_PATH = "/path/to/your/data.db"

@server.list_tools()
async def list_tools():
    return [
        {
            "name": "query_database",
            "description": "执行 SQL 查询（只读）",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "sql": {
                        "type": "string",
                        "description": "SELECT 查询语句"
                    }
                },
                "required": ["sql"]
            }
        }
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "query_database":
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # 安全检查：只允许 SELECT
        sql = arguments["sql"].strip()
        if not sql.upper().startswith("SELECT"):
            return {"content": [{"type": "text", "text": "❌ 只允许 SELECT 查询"}]}
        
        cursor.execute(sql)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        # 格式化为 Markdown 表格
        table = "| " + " | ".join(columns) + " |\n"
        table += "| " + " | ".join(["---"] * len(columns)) + " |\n"
        for row in rows:
            table += "| " + " | ".join(str(c) for c in row) + " |\n"
        
        conn.close()
        return {"content": [{"type": "text", "text": table}]}
```

配置好之后，你就可以用自然语言问 Claude：

- 「上个月销售额最高的 5 个产品是什么？」
- 「用户的平均注册时长是多少天？」

Claude 会自动把自然语言转换成 SQL，通过 MCP 执行，然后把结果变成人能看懂的文字。

## MCP 生态：2026 年现状

经过一年半的发展，MCP 生态已经相当成熟：

| 类别 | 代表项目 | 说明 |
|------|----------|------|
| **SDK** | Python SDK / TypeScript SDK | 官方开发工具包 |
| **文件系统** | @anthropic/mcp-server-filesystem | 读写本地文件 |
| **数据库** | @anthropic/mcp-server-postgres | PostgreSQL 集成 |
| **搜索** | @anthropic/mcp-server-brave-search | Brave 搜索引擎 |
| **代码** | @anthropic/mcp-server-github | GitHub 操作 |
| **浏览器** | @anthropic/mcp-server-puppeteer | 网页自动化 |
| **记忆** | @anthropic/mcp-server-memory | 持久化知识图谱 |

除了官方 Server，社区也涌现了大量第三方 MCP Server。你可以在 [mcp.so](https://mcp.so) 或 [Smithery](https://smithery.ai) 上浏览和安装。

## MCP vs Function Calling：有什么区别？

很多人问：OpenAI 的 Function Calling 和 MCP 有什么区别？

| 维度 | Function Calling | MCP |
|------|------------------|-----|
| **范围** | 单次对话内 | 跨会话持久化 |
| **标准化** | 各厂商各自定义 | 统一开放协议 |
| **安全性** | 依赖应用层 | 内置权限模型 |
| **复用性** | 每个应用重复开发 | 一次开发，到处使用 |
| **资源暴露** | 仅函数 | 工具 + 资源 + 提示词 |

一句话总结：Function Calling 是「这个聊天里帮我查个东西」，MCP 是「给你的 AI 配上一套永远不会忘的工具箱」。

## 小结

MCP 的价值在于**标准化**。以前每个 AI 应用都要重复造轮子去对接各种工具，MCP 让这件事变成了即插即用。

如果你是开发者，建议：
1. 先用现成的 MCP Server 体验一下（filesystem / brave-search 都是很好的起点）
2. 看看你的日常工具链有没有 MCP 化的空间
3. 关注 MCP 协议本身的演进（目前还在快速迭代中）

AI 的下一阶段，不是模型参数更大，而是模型能做的事情更多。MCP 就是让这件事发生的那个协议。

---

**参考链接：**
- [MCP 官方文档](https://modelcontextprotocol.io)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Claude Desktop 下载](https://claude.ai/download)
