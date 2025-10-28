# MCP原理解析及搭建私有组件库MCP

- 编号: #10
- 链接: https://github.com/Daotin/ai-coding/issues/10
- 状态: open
- 创建时间: 2025-10-28
- 更新时间: 2025-10-28
先看效果展示：

<img width="2048" height="1101" alt="Image" src="https://github.com/user-attachments/assets/186497db-a866-44bc-bc02-313619a0a2e9" />

<img width="1097" height="1465" alt="Image" src="https://github.com/user-attachments/assets/2d7e5d3f-505f-4826-b59d-0bbaa13d0dd0" />

<img width="2048" height="1371" alt="Image" src="https://github.com/user-attachments/assets/29141bf0-d592-4345-8531-eaaa04488cac" />


相关示例代码仓库：https://github.com/Daotin/fe-ai-demo/tree/main/packages/mcp-cmp

## MCP工作原理

### MCP 是如何实现的？

这个项目的核心是**模型上下文协议 (Model Context Protocol, MCP)**。它并不是自己实现了一套新的协议，而是使用了 `@modelcontextprotocol/sdk` 这个关键的依赖库。

你可以把这个项目理解为一个“工具提供者”。它本身不直接做什么复杂的事情，而是**定义了一套工具**，然后通过 MCP 协议将这些工具暴露给外部的 AI 模型或者其他消费者。

具体来说，它实现了两个核心工具：

1. `get_components_list`: 获取组件列表。
    - **作用**：读取指定的组件文档目录，返回所有 `.md` 文件的文件名列表，这些文件名就是组件名。
2. `get_component_detail`: 获取组件详情。
    - **作用**：根据传入的组件名，读取对应的 `.md` 文件，并返回文件的全部内容。

这个项目的本质就是：创建一个 MCP 服务，注册上述两个工具，然后通过两种模式（命令行模式或 HTTP 服务器模式）来启动这个服务，等待外部调用。

### 需要哪些前置条件？

1. **Node.js 环境**：项目是基于 Node.js 和 TypeScript 开发的，需要 Node.js 运行环境。
2. **组件文档目录**：必须有一个存放组件文档的文件夹。从代码和项目结构来看，这个目录里应该是一系列以组件名命名的 Markdown 文件（例如 `button.md`, `alert.md` 等）。
3. **环境变量/启动参数**：在启动服务时，必须通过命令行参数 `-dir <path>` 或设置环境变量 `COMPONENTS_DIR` 来指定组件文档目录的路径。**这是强制性的**，否则程序会报错并退出。
4. **安装依赖**：需要通过 `npm install` 或 `pnpm install` 安装 `package.json` 中声明的所有依赖。

### 执行流程是怎样的？

这个服务有两种启动模式，它们的执行流程略有不同。


### 模式一：命令行模式 (`start` 命令)

```bash
# 示例命令
mcp-cmp start --dir ./docs/element-ui
```

1. **启动**：用户在终端执行 `start` 命令，并通过 `-dir` 参数指定文档路径。
2. **解析命令**：`packages/mcp-cmp/cli.ts` 文件中的 `commander` 库解析命令行参数，获取到文档目录路径，并将其设置为环境变量 `COMPONENTS_DIR`。
3. **创建 MCP 服务**：调用 `src/index-command.ts` 中的 `startCommandServer` 函数。
4. **初始化服务**：
    - 创建一个 `McpServer` 实例。
    - 调用 `utils/index.ts` 中的 `registerTools` 函数，将 `get_components_list` 和 `get_component_detail` 这两个工具注册到服务中。
5. **建立通信**：服务通过 `StdioServerTransport` (标准输入/输出) 进行通信。这意味着父进程（调用方）可以通过 stdin 向它发送指令，并通过 stdout 从它那里接收结果。
6. **等待指令**：服务启动后，会打印 `MCP 服务器已启动，等待命令中...`，然后等待外部通过标准输入发送符合 MCP 协议的指令（例如，请求执行 `get_components_list` 工具）。

### 模式二：HTTP 服务器模式 (`serve` 命令)

```bash
# 示例命令
mcp-cmp serve --dir ./docs/element-ui --port 3000
```

1. **启动**：用户执行 `serve` 命令，并指定文档路径和可选的端口号。
2. **解析命令**：同样由 `cli.ts` 解析参数，设置 `COMPONENTS_DIR` 和 `PORT` 环境变量。
3. **创建 MCP 服务**：调用 `src/index-sse.ts` 中的 `startSSEServer` 函数。
4. **初始化服务**：与命令行模式一样，创建 `McpServer` 实例并注册相同的两个工具。
5. **启动 Web 服务器**：`startSSEServer` 内部会创建一个基于 `express` 的 HTTP 服务器。
6. **建立通信**：这个服务器会建立一个 SSE (Server-Sent Events) 端点。客户端可以通过访问这个端点来与 MCP 服务进行实时、单向的通信。
7. **等待请求**：服务器启动后，会监听指定的端口（默认为 3000），等待客户端连接并发送指令。

### 总结

`mcp-cmp` 是一个基于 `@modelcontextprotocol/sdk` 实现的工具服务。它将本地文件系统中的组件文档（Markdown 文件）封装成了两个可以通过协议调用的工具。它的核心价值在于**充当了连接 AI 模型和本地知识库（组件文档）的桥梁**，让 AI 模型有能力查询和获取这些文档的内容。




