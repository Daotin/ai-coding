# 自动化操作MCP

- 编号: #20
- 链接: https://github.com/Daotin/ai-coding/issues/20
- 状态: open
- 创建时间: 2025-10-28
- 更新时间: 2025-10-28
- [browser MCP](https://browsermcp.io/)：使用Cursor 等自动化操作网页，复用已登录的浏览器实例。
- [谷歌Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)：能访问Chrome DevTools 全部功能。比如 查 DOM/CSS、跑 JS、看 Console、抓网络、录性能 trace。运行性能跟踪、检查 DOM 并对网页执行实时调试。

<img width="1002" height="535" alt="Image" src="https://github.com/user-attachments/assets/3b696351-8893-4ac8-b8bc-ad3bf19cd758" />

使用示例：

- 在浏览器中验证你的更改是否按预期运行。
- 在 localhost:8080 上有几张图片加载失败，发生了什么？


browser-tools使用：

```tsx
"browser-tools": {
    "command": "npx",
    "args": ["-y", "@agentdeskai/browser-tools-mcp@latest"]
}
```

npx -y @agentdeskai/browser-tools-server@latest
