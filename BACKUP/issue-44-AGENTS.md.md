---
layout: post
title: "AGENTS.md"
date: 2025-12-15
tags: [AI经验]
---
## 是什么？

给AI看的README——AGENTS.md，让AI真正理解你的项目。

你可以把它理解为“AI 使用手册、项目操作规程、工程化规范”的结合体，用于指导 AI Agents 在你的开发项目中工作。

## 干嘛的？

主要作用：

- **提供项目背景**：告诉 AI 这个项目是做什么的。

- **说明操作步骤**：比如如何编译、测试、部署。

- **统一代码风格**：让 AI 遵守你的代码规范。

- **安全提示**：提醒 AI 注意安全相关的事项。

- **团队协作信息**：像提交信息规范、PR 流程、数据集说明等，都可以写进去。

- **支持大项目**：如果是大型 monorepo，可以在子项目里再放一个 AGENTS.md，AI 会优先读取离它最近的文件。

## 那么，一个标准的AGENTS.md文件，应该包含哪些部分？

一个标准的 **AGENTS.md** 文件，其实就是给 AI 编程助手准备的“操作手册”。它没有强制格式，但通常会包含以下几个核心部分，帮助 AI 更好地理解和协作：

- **项目概览 (Project Overview)**  
   简单介绍项目的目的、功能和主要模块，让 AI 知道这是个什么样的工程。
- **构建与测试命令 (Build & Test Commands)**  
   列出编译、运行、测试的具体命令，比如 `npm run build`、`pytest` 等。这样 AI 在生成代码时能自动补齐正确的流程。
- **代码风格指南 (Code Style Guidelines)**  
   包括缩进规则、命名规范、Lint 工具要求等，确保 AI 写出的代码符合团队习惯。
- **测试说明 (Testing Instructions)**  
   告诉 AI 如何运行单元测试、集成测试，或者哪些测试必须通过。
- **安全注意事项 (Security Considerations)**  
   提醒 AI 避免使用不安全的库、注意数据隐私、遵守安全策略。
- **额外说明 (Extra Instructions)**
  - 提交信息规范（commit message 格式）
  - Pull Request 流程
  - 大数据集或部署步骤的说明
  - 团队内部的特殊约定
- **大项目支持 (Monorepo Guidance)**  
   如果是大型仓库，可以在子项目里放置额外的 AGENTS.md，AI 会优先读取离它最近的文件，从而获得更精确的上下文。

## 示例

下面是一个现代 Vue 前端项目的 AGENTS.md  示例：

````markdown
# AGENTS.md

## 📖 项目概览
这是一个基于 **Vue 3 + Vite + TypeScript** 的现代前端项目，主要用于构建单页应用 (SPA)。  
目标：提供高性能、可维护的前端架构，支持组件化开发和自动化测试。

---

## ⚙️ 构建与运行
- 开发环境启动：  
  ```bash
  npm install
  npm run dev
  ```
- 构建生产版本：  
  ```bash
  npm run build
  ```
- 本地预览生产构建：  
  ```bash
  npm run preview
  ```

---

## 🧪 测试说明
- 单元测试：  
  ```bash
  npm run test:unit
  ```
- 端到端测试 (E2E)：  
  ```bash
  npm run test:e2e
  ```
- 测试框架：使用 **Vitest + Cypress**

---

## 🎨 代码风格指南
- 使用 **ESLint + Prettier** 保持统一风格  
- 缩进：2 空格  
- 命名规范：  
  - 组件文件：`PascalCase.vue`  
  - 工具函数：`camelCase.ts`  
- 提交前必须通过 Lint 检查：  
  ```bash
  npm run lint
  ```

---

## 🔒 安全注意事项
- 禁止在代码中硬编码 API 密钥或敏感信息  
- 所有网络请求必须通过统一的 `api/` 模块  
- 使用 `.env` 文件管理环境变量，并确保 `.env.local` 不提交到仓库  

---

## 📦 提交与协作规范
- Commit message 使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式，例如：  
  ```
  feat: 添加用户登录页面
  fix: 修复导航栏样式问题
  ```
- Pull Request 必须包含：  
  - 变更说明  
  - 测试结果截图（如有 UI 改动）  
  - Reviewer 指定  

---

## 🚀 部署说明
- 使用 **Vercel** 或 **Netlify** 自动化部署  
- 部署前需通过所有测试  
- 环境变量在平台配置中设置，不直接写入代码  

---

## 📂 大型项目支持
- 如果仓库为 Monorepo：  
  - 每个子项目都应包含独立的 `AGENTS.md`  
  - AI 助手会优先读取离当前文件最近的说明  

---

## 📝 额外说明
- 推荐使用 **VS Code + Volar 插件** 进行开发  
- 所有新组件必须包含基础单元测试  
- 大型数据集或第三方依赖需在 `docs/` 中说明使用方法
````






