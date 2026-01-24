---
layout: post
title: "OpenSkills，AI 编程助手的\"Forge\""
date: 2026-01-24
tags: [AI工具]
---
**OpenSkills** 是一个**通用技能加载器 CLI 工具**，它的核心使命是**打破不同 AI 编程助手之间的技能壁垒**，让 Claude Code 的 Skills 系统变得通用化、跨平台化 。


## 一句话总结

**OpenSkills = AI 编程助手的"Forge"（模组管理器）**，让你写的技能（SKILL.md）能在 Claude Code、Cursor、Windsurf、Aider 等所有主流 AI 工具中通用 。

---

## 核心功能

| 功能 | 说明 |
|------|------|
| **跨平台兼容** | 100% 兼容 Claude Code 的 SKILL.md 格式，让其他 AI 助手也能使用  |
| **Git 安装** | 支持从 GitHub、私有仓库、本地路径安装技能，不限于官方市场  |
| **统一管理** | 通过 CLI 命令安装、更新、删除、同步技能，像 npm 一样管理  |
| **Universal Mode** | 将技能安装到 `.agent/skills/`，避免与 Claude Code 内置路径冲突  |
| **版本控制** | 技能用 Git 管理，团队协作时可锁定版本，避免配置漂移  |

---

## 为什么需要 OpenSkills？

### 痛点场景

**场景 1：团队工具不统一**
- 同事 A 用 Claude Code，同事 B 用 Cursor
- 同样的代码规范，却要分别配置两套 Skills → **重复劳动**

**场景 2：技能来源受限**
- Claude Code 官方市场技能有限，想装 GitHub 上的社区技能 → **装不了**

**场景 3：企业私有规范**
- 公司有内部开发规范、API 文档模板，想做成 Skill → **无法私有化部署**

**场景 4：多工具切换**
- 写代码用 Cursor，调试复杂逻辑用 Claude Code，脚本任务用 Aider → **每套工具都要重新配置 Skills**

### OpenSkills 的解决方案

```
写一次 SKILL.md → 所有 AI 助手通用
从 GitHub 随便装 → 官方、社区、私有仓库都行
团队统一配置 → 提交到 Git，全员同步
```



---

## 如何使用 OpenSkills？

### 1. 安装 CLI 工具

```bash
# 全局安装（推荐）
npm install -g openskills

# 或使用 npx（无需全局安装）
npx openskills
```


### 2. 安装技能（以 Anthropic 官方技能库为例）

```bash
# 安装到项目本地（默认 .claude/skills/）
npx openskills install anthropics/skills

# 安装到通用目录（推荐多工具共存时使用）
npx openskills install anthropics/skills --universal

# 从私有仓库安装
npx openskills install git@github.com:company/private-skills.git
```


### 3. 同步生成 AGENTS.md

```bash
# 扫描已安装技能，生成/更新 AGENTS.md
npx openskills sync
```

执行后，AI 助手就能在对话中识别并使用这些技能了 。

### 4. 常用命令速查

| 命令 | 作用 |
|------|------|
| `openskills list` | 查看已安装的所有技能 |
| `openskills read <skill-name>` | 读取某个技能的详细内容 |
| `openskills update` | 更新技能到最新版本 |
| `openskills remove <skill-name>` | 卸载指定技能 |
| `openskills sync` | 重新生成 AGENTS.md |



---

## 实际应用场景

### 场景 1：团队协作统一配置

```bash
# 在项目根目录执行
npx openskills install company/internal-skills --universal
npx openskills sync

# 提交到 Git
git add .agent/skills AGENTS.md
git commit -m "Add team skills"
```

团队成员 clone 项目后，无论用 Claude Code 还是 Cursor，AI 都会自动识别这些 Skills 。

### 场景 2：多工具无缝切换

你可能在不同场景使用不同工具：
- 写代码用 **Cursor**（IDE 集成好）
- 调试用 **Claude Code**（上下文长，适合复杂分析）
- 脚本任务用 **Aider**（轻量快速）

通过 OpenSkills，你的 Skills 配置在所有工具间**无缝迁移**，避免重复配置 。

### 场景 3：企业私有知识库

将内部开发规范、API 文档、代码模板做成 Skill：
```bash
npx openskills install git@github.com:company/private-skills.git
```

这些 Skill 只在内部使用，**不会泄露到公网**，保护专有知识 。

---

## 技术细节：Universal Mode

如果你**同时使用 Claude Code 和其他 AI 助手**，建议开启 Universal Mode：

```bash
npx openskills install anthropics/skills --universal
```

这会安装到 `.agent/skills/` 而非 `.claude/skills/`，避免与 Claude Code 内置技能冲突 。

### 技能查找优先级（从高到低）

1. `./.agent/skills/`（项目级，Universal）
2. `~/.agent/skills/`（全局，Universal）
3. `./.claude/skills/`（项目级，Claude Code）
4. `~/.claude/skills/`（全局，Claude Code）

意味着：**项目级技能 > 全局技能，Universal > Claude 专用** 

---

## 与 Claude Code 原生 Skills 的区别

| 特性 | Claude Code 原生 | OpenSkills |
|------|-----------------|------------|
| 安装来源 | 仅限官方市场 | 任意 Git 仓库、本地路径、私有仓库 |
| 支持工具 | 仅 Claude Code | Claude Code、Cursor、Windsurf、Aider 等 |
| 调用方式 | `Skill("pdf")` 工具 | `openskills read pdf` 命令 |
| 技能格式 | SKILL.md | 完全相同的 SKILL.md |
| 文件夹结构 | `.claude/skills/` | `.claude/skills/` 或 `.agent/skills/` |



---

## 总结

**OpenSkills 是 AI 编程生态的"通用适配器"**：

- **对开发者**：一次编写，处处运行，不再为不同 AI 工具重复造轮子
- **对团队**：统一规范，版本可控，把团队知识沉淀成可复用的 Skills
- **对企业**：私有化部署，保护核心知识资产

如果你在使用多个 AI 编程助手，或者想让 Claude Code 的技能在团队内共享，OpenSkills 是目前最优雅的解决方案 。
