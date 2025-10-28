# Figma远程MCP

- 编号: #19
- 链接: https://github.com/Daotin/ai-coding/issues/19
- 状态: open
- 创建时间: 2025-10-28
- 更新时间: 2025-10-28
以Cursor为例：

1、添加mcp：

```tsx
{
  "mcpServers": {
    "figmaRemoteMcp": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

2、回到设置页面你就会看到多了一个 Figam 的 MCP，右边还有个“Connect”按钮，我们点击，系统会询问是不是要打开外部网站，你选择打开就行。

注意：Figma 的远程 MCP 服务需要订阅用户。（可闲鱼解决）

3、页面最下方切换到**开发者模式**，选中你想要复刻的页面然后右键选择复制所选的链接。

（好像不需要，有Copy link to Selection，待验证...）

<img width="781" height="312" alt="Image" src="https://github.com/user-attachments/assets/ed657ed0-89b4-4444-bddc-e219f547059d" />

4、之后就可以在 Cursor 里面将模型换成 GPT-5 Codex ，然后让 Agent 调用 Figma MCP 查询对应链接的设计信息还原成网页了。
