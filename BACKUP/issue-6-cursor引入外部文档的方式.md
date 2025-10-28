# cursor引入外部文档的方式

- 编号: #6
- 链接: https://github.com/Daotin/ai-coding/issues/6
- 状态: open
- 创建时间: 2025-10-27
- 更新时间: 2025-10-27
1. 使用 `/docs` 指令添加相关框架和库的文档
2. 使用cursor rule+ firecrawl抓取的文档，或者使用 [[crawl4ai](https://github.com/unclecode/crawl4ai)](https://github.com/unclecode/crawl4ai) ，更甚者使用[[Open Lovable](https://github.com/firecrawl/open-lovable)](https://github.com/firecrawl/open-lovable)
3. cursor rule可以使用 [[cursor-custom-agents-rules-generator](https://github.com/bmadcode/cursor-custom-agents-rules-generator)](https://github.com/bmadcode/cursor-custom-agents-rules-generator) 生成适配自己项目的workflow
4. 有一个神器：只需将 Github 仓库链接里的 [github.com](http://github.com/) 或 [github.io](http://github.io/) 更改为 [gitmcp.io](http://gitmcp.io/)，然后在 Cursor 里配置一下 remote mcp server 就可以根据文档写代码了。[[GitMCP](https://gitmcp.io/)](https://gitmcp.io/)
5. [[Context7](https://github.com/upstash/context7)](https://github.com/upstash/context7) ：Context7 MCP 从源头获取最新的、版本特定的文档和代码示例，并直接插入到你的提示中。（示例：使用 context7 mcp 创建一个nextjs项目。
6. 原理：https://deepwiki.com/search/_cdfab449-3840-45bb-9448-23a879393718
7. 支持的库：https://context7.com/
8. 一键快速将一个 Github 代码库转为文档：https://www.gittodoc.com/
