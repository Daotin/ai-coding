---
layout: post
title: "Claude Code使用教程"
date: 2025-10-28
tags: [AI工具]
---
## 原版使用

> 前提，你得有 **Claude 的付费账号**，或者 **Anthropic API 的付费账号**...至少 Claude 告诉你是这样
> 

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code
# Navigate to your project
cd your-awesome-project
# Start coding with Claude
claude
```

## claucode使用

确保您的系统已安装 **Node.js 18.0** 或更高版本摸摸你的良心但是

**第一步：安装Claude Code**

```bash
npm install -g @anthropic-ai/claude-code
```

**第二步：配置认证**

- API令牌：从控制台获取 `sk-` 开头的令牌
- API地址：`https://claucode.com`

---

**第三步：设置环境变量**

*macOS/Linux系统：*

```bash
export ANTHROPIC_AUTH_TOKEN=sk-你的Token
export ANTHROPIC_BASE_URL=https://claucode.com

```

*Windows系统：*

```powershell
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "sk-你的Token", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://claucode.com", "User")
```

---

**第四步：开始使用** 输入 claude 即刻开始

```bash
> cd 你项目目录
> claude
```

## AnyRouter

anyrouter使用cc：

- https://www.cnblogs.com/xiaoqi/p/18980593/claude-code-free
- https://x.com/drmrzhong/status/1947619179085107269

1️⃣ 安装 Node.js（已安装可跳过）

确保 Node.js 版本 ≥ 18.0

```bash
# Ubuntu / Debian 用户
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
sudo apt-get install -y nodejs
node --version

# macOS 用户
sudo xcode-select --install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
node --version
```

2️⃣ 安装 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

3️⃣ 开始使用

- **获取 Auth Token：** `ANTHROPIC_AUTH_TOKEN` ：注册后在 `API令牌` 页面点击 `添加令牌` 获得（以 `sk-` 开头）
- 名称随意，额度建议设为无限额度，其他保持默认设置即可
- **API地址：** `ANTHROPIC_BASE_URL`：`https://anyrouter.top` 是本站的 API 服务地址，**与主站地址相同**

在您的项目目录下运行：

```bash
cd your-project-folder
export ANTHROPIC_AUTH_TOKEN=sk-你的Token
export ANTHROPIC_BASE_URL=https://anyrouter.top
claude
```

运行后

- 选择你喜欢的主题 + Enter
- 确认安全须知 + Enter
- 使用默认 Terminal 配置 + Enter
- 信任工作目录 + Enter

开始在终端里和你的 AI 编程搭档一起写代码吧！🚀

4️⃣ 配置环境变量（推荐）

为避免每次重复输入，可将环境变量写入 bash_profile 和 bashrc：

```bash
echo -e '\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.bash_profile
echo -e '\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.bash_profile
echo -e '\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.bashrc
echo -e '\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.bashrc
echo -e '\n export ANTHROPIC_AUTH_TOKEN=sk-...' >> ~/.zshrc
echo -e '\n export ANTHROPIC_BASE_URL=https://anyrouter.top' >> ~/.zshrc
```

重启终端后，直接使用：

```bash
cd your-project-folder
claude
```

即可使用 Claude Code

## Claude Code Router

https://github.com/musistudio/claude-code-router

## GLM 一行

```bash
curl -L -o claude_code_prod.sh "http://bigmodel-us3-prod-marketplace.cn-wlcb.ufileos.com/1753683727739-0b3a4f6e84284f1b9afa951ab7873c29.sh?ufileattname=claude_code_prod.sh" && chmod +x claude_code_prod.sh && ./claude_code_prod.sh
```

然后输入 key 就好了

对于 key，可以在这里获取：
https://bigmodel.cn/usercenter/proj-mgmt/apikeys

CC 使用：https://docs.bigmodel.cn/cn/guide/develop/claude
