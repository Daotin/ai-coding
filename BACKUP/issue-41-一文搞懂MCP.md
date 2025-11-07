---
layout: post
title: "一文搞懂MCP"
date: 2025-11-07
tags: [AI工具]
---
## MCP是什么

MCP（Model Context Protocol）是 Anthropic 在去年提出的一种开放协议，用于标准化应用程序与大语言模型（LLMs）之间的上下文交互，它在外部数据源和 AI 工具之间建立链接，实现了类似 AI 应用的'USB-C'通用接口。

简单来说借助 MCP 可以用来给 AI 使用插件，来帮助 AI 能够看见、理解其他数据源，典型的应用场景比如在 Windsurf 和 Cursor 里，通过各种 MCP 工具连接到其他的服务，来完成一些 AI 本身无法实现的功能。

比如连接文本生成图像的 MCP，在 Curosr 中，让其[将 emoji 替换成图片](https://www.youtube.com/watch?v=oAoigBWLZgE)：

<img width="2046" height="924" alt="Image" src="https://github.com/user-attachments/assets/9f12fc01-2fc3-4a99-b2b9-7fbc3e7c3473" />

比如，根据外部的编码规范，[自动格式化代码](https://www.youtube.com/watch?v=oAoigBWLZgE)：

<img width="1704" height="1080" alt="Image" src="https://github.com/user-attachments/assets/3470fcb1-d48d-4cf0-866e-a859f6b2b02f" />

### MCP图解

<img width="1550" height="1768" alt="Image" src="https://github.com/user-attachments/assets/1345eef2-bcb2-42e2-99fe-d1671d2cec98" />

## MCP的核心

1. MCP 的核心价值

背景痛点：传统 Copilot（如 Codium）仅能基于代码库回答问题，但无法执行文件操作、搜索外部数据源（如文档、网络）等动作。
Agent（代理）的进化：Cascade 作为新一代 Agent，通过工具扩展能力（文件编辑、搜索等），但仍需连接更多数据源（如 Slack、GitHub、Google Drive）。

MCP 的作用：提供标准化接口，让 Cascade 等代理安全访问外部数据源，将数据转化为可操作的上下文。

2. MCP 技术架构

三大组件：Client（客户端）：Windsurf/Cascade 作为使用者。
Server（服务器）：轻量级本地进程，通过 API 连接数据源（如 Slack API）。
Data Source：本地（如文件系统）或远程（如 Slack 频道）数据源。

关键特性：无需自建服务器：可使用开源预构建服务器（提供资源链接）。
标准化协议：统一接口简化工具集成。

3. 实战案例：集成 Slack 频道
场景需求：让 Cascade 访问 Slack 频道中的编码规范讨论，指导代码重构。
配置步骤：创建 Slack App：获取 API 令牌和团队 ID。
编辑 MCP 配置文件：在 Windsurf 的 MCPconfig.json 中添加 Slack 服务器配置（粘贴 JSON 片段）。
验证连接：通过 Cascade 的 "MCP 服务器" 图标刷新并激活服务。

使用示例：提问："What are my coding best practices for JavaScript? Check Slack channel # XYZ."
结果：Cascade 调用 MCP 工具读取频道历史，提取命名规范、语法风格等规则。
应用：直接要求 Cascade 按规范重构 index.ts 文件。

4. MCP 的优势
扩展性：无缝接入企业知识库（如设计讨论、内部文档）。

易用性：开箱即用的服务器 + 可视化配置（无需编码）。

安全性：本地服务器进程控制数据访问权限。

5. 资源与后续步骤
开源 MCP 服务器：提供预构建的 Slack/GitHub 等服务器下载链接。
配置文档：JSON 字段说明（如 slackbot_token、team_id 的获取方式）。

总结：MCP 是 Windsurf 实现 "智能体即服务" 的关键，通过标准化协议将企业内外数据转化为 AI 可操作的上下文，显著提升代码生成质量和场景适用性。



## 快速上手

> 使用AI辅助：仔细完整阅读下面链接和提供的llms-full文件，出一个一步步引导学习教程，让我学会如何写一个MCP server，包括command模式和sse模式。使用node+npm+typescrpt技术栈：[https://modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction)



- https://modelcontextprotocol.io/llms-full.txt
- https://modelcontextprotocol.io/introduction



### 创建一个command MCP

> 示例是一个计算器，提供2个工具，一个是calculate计算基本的加减乘除，一个是evaluate，使用js的eval直接计算复杂的表达式。

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 创建MCP服务器
const server = new McpServer({
  name: "Calculator",
  version: "1.0.0",
});

// 基础运算工具
server.tool(
  "calculate",
  {
    a: z.number(),
    b: z.number(),
    operator: z.enum(["+", "-", "*", "/"]),
  },
  async ({ a, b, operator }) => {
    let result: number;
    switch (operator) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      case "/":
        if (b === 0) {
          return {
            content: [{ type: "text", text: "Error: Division by zero" }],
            isError: true,
          };
        }
        result = a / b;
        break;
      default:
        return {
          content: [{ type: "text", text: "Error: Invalid operator" }],
          isError: true,
        };
    }
    return {
      content: [{ type: "text", text: String(result) }],
    };
  }
);

// 复杂表达式计算工具
server.tool(
  "evaluate",
  {
    expression: z
      .string()
      .refine(
        (expr) => /^[\d\s+\-*/().]+$/.test(expr),
        "Expression can only contain numbers, operators (+, -, *, /) and parentheses"
      ),
  },
  async ({ expression }) => {
    try {
      // 安全检查:只允许数字、运算符和括号
      if (!/^[\d\s+\-*/().]+$/.test(expression)) {
        throw new Error("Invalid characters in expression");
      }

      // 计算表达式
      const result = eval(expression);

      // 检查结果是否为有效数字
      if (typeof result !== "number" || isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid result");
      }

      return {
        content: [{ type: "text", text: String(result) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : "Invalid expression"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 启动服务器
// 开始在Stdin上接收消息，并在Stdout上发送消息
const transport = new StdioServerTransport();
await server.connect(transport);

```

然后通过tsc编译到build：
```json
{
  "type": "module",
  "scripts": {
    "build": "tsc"
  },
}

```

如何测试？

可以使用 [MCP Inspector](https://github.com/modelcontextprotocol/inspector) 测试：

```bash
npx @modelcontextprotocol/inspector node build/calc.js
```

<img width="2111" height="1839" alt="Image" src="https://github.com/user-attachments/assets/d5f3143e-c1ab-4db0-bd22-2303e957fbcc" />


添加到Cursor中使用：

<img width="737" height="315" alt="Image" src="https://github.com/user-attachments/assets/321301be-179a-43b9-a742-943a6c67ebd9" />

测试：

<img width="1041" height="1475" alt="Image" src="https://github.com/user-attachments/assets/10604d7d-58f5-4416-98cf-6cca45c719a8" />

### SSE MCP

```js
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

// 创建一个 Express 应用
const app = express();
const PORT = 3000;

// 创建一个 MCP 服务器
const server = new McpServer({
  name: "calc-mcp",
  version: "1.0.0",
});

// 定义一个复杂的计算器工具
server.tool(
  "calculator",
  {
    expression: z.string().min(1), // 确保输入的表达式不为空
  },
  async ({ expression }) => {
    try {
      // 使用 eval 计算表达式
      const result = eval(expression);
      return {
        content: [
          {
            type: "text",
            text: `The result of the expression "${expression}" is ${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Invalid expression "${expression}"`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 存储传输对象
let transport: SSEServerTransport;

// 设置 SSE 传输
app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  // 这里需要处理来自客户端的消息
  // 注意：在实际应用中，你可能需要根据客户端的请求来路由消息到对应的传输
  await transport.handlePostMessage(req, res);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`calc-mcp server is running on http://localhost:${PORT}`);
});

```

然后需要在控制台启动：
```
D:\Gitee\mcp-demo>node build/calc-sse.js
calc-mcp server is running on http://localhost:3000

```

才能加入到Cursor的MCP Server。


### 完整通信流程

在MCP架构下的SSE通信流程是：

- 客户端通过GET /sse请求建立SSE连接
- 服务器创建SSEServerTransport实例并与MCP服务器建立连接
- 客户端需要调用工具时（如使用calculator），发送MCP格式的消息到POST /messages
- handlePostMessage处理这个POST请求并转发给MCP服务器
- MCP服务器内部路由到对应的工具处理函数（如calculator的处理函数）
- 处理结果通过SSE连接异步推送回客户端，而不是在POST响应中直接返回

> SSEServerTransport的handlePostMessage方法实际上是一个桥接器，它接收HTTP POST请求并将其转换为MCP内部消息，然后发送给MCP服务器处理。同时，它也负责将MCP服务器的响应通过之前建立的SSE连接发送回客户端。

这是一个典型的通过HTTP和SSE实现MCP协议的方式。客户端与服务器之间保持长连接（通过SSE），而客户端的请求则通过标准HTTP POST发送。


## MCP Server

- https://glama.ai/mcp/servers
- https://smithery.ai/
- 官方的 MCP Server 列表：https://github.com/modelcontextprotocol/servers
- https://mcp.composio.dev/
- https://mcp.so/
- [Cursor MCP推荐](https://mp.weixin.qq.com/s/mShTSOispTM0JQftcRgkrQ)


以下是官方推荐的 Model Context Protocol (MCP) 服务器列表：

| 分类              | 服务器名称               | 描述                                   |
| --------------- | ------------------- | ------------------------------------ |
| **数据和文件系统**     | 文件系统                | 具有可配置访问控制的安全文件操作                     |
|                 | PostgreSQL          | 具有模式检查功能的只读数据库访问                     |
|                 | SQLite              | 数据库交互和商业智能功能                         |
|                 | Google Drive        | 提供对 Google Drive 的文件访问和搜索功能          |
| **开发工具**        | Git                 | 读取、搜索和操作 Git 仓库的工具                   |
|                 | GitHub              | 集成 GitHub API，用于仓库管理、文件操作等           |
|                 | GitLab              | 集成 GitLab API，支持项目管理                 |
|                 | Sentry              | 从 Sentry.io 检索和分析问题                  |
| **Web 和浏览器自动化** | Brave Search        | 使用 Brave 的搜索 API 进行 Web 和本地搜索        |
|                 | Fetch               | 为 LLM 优化的 Web 内容获取和转换                |
|                 | Puppeteer           | 提供浏览器自动化和 Web 抓取功能                   |
| **生产力和通信**      | Slack               | 提供频道管理和消息功能                          |
|                 | Google Maps         | 提供位置服务、路线和地点详情                       |
|                 | Memory              | 基于知识图谱的持久记忆系统                        |
| **AI 和专用工具**    | EverArt             | 使用各种模型进行 AI 图像生成                     |
|                 | Sequential Thinking | 通过思维序列进行动态问题解决                       |
|                 | AWS KB Retrieval    | 使用 Bedrock Agent Runtime 从 AWS 知识库检索 |


<img width="2622" height="4362" alt="Image" src="https://github.com/user-attachments/assets/0adc2854-4d73-4467-b61b-65b559381ea6" />
