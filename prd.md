# AI Coding 笔记自动化目录更新项目 - PRD

## 1. 背景

当前项目是一个 GitHub 仓库，用于记录个人 AI Coding 的学习心得与笔记。所有笔记均以 GitHub Issue 的形式创建和管理。为了方便快速查阅和导航，`README.md` 文件被用作一个中央目录，手动维护着所有 Issue 的列表。

**痛点：** 每次创建、修改或关闭 Issue 时，都需要手动更新 `README.md` 文件来同步状态，这个过程非常繁琐、耗时且容易出错，降低了记录笔记的效率和积极性。

## 2. 项目目标

**核心目标：** 实现完全自动化的 `README.md` 目录更新机制。

通过引入 GitHub Actions，我们旨在建立一个无人值守的工作流。该工作流能够实时响应 Issue 的变化，自动抓取、分类和格式化 Issue 列表，并将其更新到 `README.md` 文件中，从而彻底告别手动维护。

## 3. 需求详述

### 3.1 触发条件

工作流必须在以下任一事件发生时被自动触发，以确保 `README.md` 的内容与 Issue 的实际状态保持 100% 同步：

- **创建 Issue (`opened`)**: 当一篇新笔记（Issue）被创建时。
- **编辑 Issue (`edited`)**: 当一篇笔记的标题被修改时。
- **关闭 Issue (`closed`)**: 当一篇笔记被标记为完成或废弃时。
- **添加标签 (`labeled`)**: 当为一篇笔记添加分类标签时。
- **移除标签 (`unlabeled`)**: 当从一篇笔记上移除分类标签时。

### 3.2 核心逻辑

工作流的核心任务是生成一个按标签分类的、结构化的 Issue 列表。

- **数据源**: 只抓取状态为 `open` (开启) 的 Issue。已关闭的 Issue 将自动从目录中移除。
- **分类规则**:
  - Issue 列表必须按照其 **标签 (Label)** 进行分组。
  - 每个标签名将作为一个独立的分类标题。
  - **多标签处理**: 如果一个 Issue 拥有多个标签，它应该同时出现在所有对应标签的分类下。
  - **无标签处理**: 如果一个 Issue 没有任何标签，它应该被归入一个名为 `未分类` 的默认分组中。
- **排序规则**: 分类标题（标签）之间，以及每个分类下的 Issue 列表，可以按创建时间、更新时间或字母顺序排序（默认为 API 返回顺序）。

### 3.3 输出格式

更新后的 `README.md` 内容必须遵循以下格式，以保证可读性和美观性：

- **占位符**: 脚本通过识别 `README.md` 文件中预设的一对注释 `<!-- ISSUES-LIST:START -->` 和 `<!-- ISSUES-LIST:END -->` 来确定更新区域。脚本只会修改这对注释之间的内容，确保文件其他部分不受影响。
- **分类标题**: 每个标签分类使用 Markdown 的二级标题（`##`）进行展示，并附带一个 Emoji 图标，例如：`## 🏷️ AI Tools`。
- **Issue 列表**: 在每个分类标题下，使用无序列表（`*`）展示该分类的 Issue。每一项的格式为：`* [Issue标题](Issue链接)`，例如：`* [如何使用 Copilot Chat](https://github.com/user/repo/issues/123)`。

## 4. 实现方案

我们将采用 **GitHub Actions + 自定义 Node.js 脚本** 的方案，以实现需求的灵活性和可维护性。

### 4.1 技术选型

- **自动化引擎**: GitHub Actions
- **脚本语言**: Node.js (v20)
- **GitHub API 交互库**: `@octokit/rest` (官方推荐)

### 4.2 文件结构

您需要在仓库中创建以下文件和目录：

```
ai-coding/
├── .github/
│   ├── workflows/
│   │   └── update-readme.yml  # GitHub Actions 工作流配置文件
│   └── scripts/
│       └── update-readme.js   # 核心逻辑处理脚本
├── node_modules/              # (自动生成)
├── package.json               # Node.js 项目依赖管理
├── package-lock.json          # (自动生成)
└── README.md                  # 笔记目录文件
```

### 4.3 工作流 (`update-readme.yml`)

此文件定义了自动化的触发时机和执行步骤。

1.  **触发器**: 监听 `issues` 事件的 `opened`, `edited`, `closed`, `labeled`, `unlabeled` 类型。
2.  **权限**: 授予工作流读写 `contents` 和读取 `issues` 的权限。
3.  **步骤**:
    a. **检出代码**: 使用 `actions/checkout@v4` 将仓库代码拉取到运行环境中。
    b. **设置 Node.js 环境**: 使用 `actions/setup-node@v4` 准备 Node.js 运行环境。
    c. **安装依赖**: 运行 `npm install` 来安装 `package.json` 中定义的 `@octokit/rest` 库。
    d. **执行脚本**: 运行 `node ./.github/scripts/update-readme.js`，并通过环境变量 `GITHUB_TOKEN` 传入认证令牌。
    e. **提交变更**: 检查 `README.md` 文件是否有实际变更。如果有，则自动 `commit` 和 `push` 到主分支。

### 4.4 核心脚本 (`update-readme.js`)

此脚本是实现所有核心逻辑的“大脑”。

1.  **初始化**: 引入所需模块 (`fs`, `@octokit/rest`)，并使用 `GITHUB_TOKEN` 初始化 Octokit 客户端。
2.  **获取数据**: 调用 GitHub API，获取仓库中所有状态为 `open` 的 Issue 及其标签信息。
3.  **处理数据**:
    - 创建一个 `Map` 对象用于存放分类结果，键为标签名，值为 Issue 对象数组。
    - 遍历所有 Issue，根据其标签将其放入 `Map` 中对应的数组。若无标签，则放入名为 `未分类` 的键中。
4.  **生成 Markdown**:
    - 遍历 `Map`，将其转换为格式化的 Markdown 字符串。
5.  **更新文件**:
    - 读取 `README.md` 的原始内容。
    - 使用正则表达式定位 `<!-- ISSUES-LIST:START -->` 和 `<!-- ISSUES-LIST:END -->` 之间的区域。
    - 将该区域替换为新生成的 Markdown 字符串。
    - 将更新后的内容写回 `README.md` 文件。

## 5. 用户手动操作指南

**您需要按照以下步骤，在您的 `ai-coding` 仓库中完成初始设置。**

### 步骤 1: 在 `README.md` 中添加占位符

打开 `README.md` 文件，在您希望展示 Issue 列表的位置（例如，在一个主标题下），添加以下两行注释。工作流将在这里自动生成内容。

```markdown
### 📚 AI Coding 笔记目录

<!-- ISSUES-LIST:START -->
<!-- 此列表由 GitHub Actions 自动生成，请勿手动修改 -->
<!-- ISSUES-LIST:END -->
```

### 步骤 2: 创建 `package.json` 文件

在您的项目根目录下创建 `package.json` 文件。这个文件告诉 Node.js 我们的脚本需要哪些依赖。

**文件名:** `package.json`
**内容:**

```json
{
  "name": "ai-coding-readme-updater",
  "version": "1.0.0",
  "description": "Updates README with a list of issues categorized by labels.",
  "main": ".github/scripts/update-readme.js",
  "scripts": {
    "start": "node .github/scripts/update-readme.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@octokit/rest": "^20.0.2"
  }
}
```

### 步骤 3: 创建 GitHub Actions 工作流文件

1.  在项目根目录下，创建 `.github` 文件夹。
2.  在 `.github` 文件夹内，创建 `workflows` 文件夹。
3.  在 `workflows` 文件夹内，创建 `update-readme.yml` 文件。

**文件名:** `.github/workflows/update-readme.yml`
**内容:**

```yaml
name: Update README with Issues by Label

on:
  issues:
    types: [opened, edited, closed, labeled, unlabeled]

jobs:
  update-readme:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Update README section
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO_OWNER: ${{ github.repository_owner }}
          REPO_NAME: ${{ github.event.repository.name }}
        run: node ./.github/scripts/update-readme.js

      - name: Commit and push if changed
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add README.md
          if ! git diff --staged --quiet; then
            git commit -m "docs(readme): auto-update issue list by label"
            git push
          else
            echo "No changes to commit."
          fi
```

### 步骤 4: 创建核心逻辑脚本

1.  在 `.github` 文件夹内，创建 `scripts` 文件夹。
2.  在 `scripts` 文件夹内，创建 `update-readme.js` 文件。

**文件名:** `.github/scripts/update-readme.js`
**内容:**

```javascript
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const readmePath = 'README.md';
const placeholderStart = '<!-- ISSUES-LIST:START -->';
const placeholderEnd = '<!-- ISSUES-LIST:END -->';

async function main() {
  console.log(`Fetching open issues for ${owner}/${repo}...`);

  const { data: issues } = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
  });

  console.log(`Found ${issues.length} open issues.`);

  const issuesByLabel = new Map();

  for (const issue of issues) {
    if (issue.pull_request) continue; // Skip pull requests

    const labels = issue.labels.map((label) => label.name);

    if (labels.length === 0) {
      if (!issuesByLabel.has('未分类')) {
        issuesByLabel.set('未分类', []);
      }
      issuesByLabel.get('未分类').push(issue);
    } else {
      for (const label of labels) {
        if (!issuesByLabel.has(label)) {
          issuesByLabel.set(label, []);
        }
        issuesByLabel.get(label).push(issue);
      }
    }
  }

  let newContent = '';
  // Sort labels alphabetically for consistent order
  const sortedLabels = Array.from(issuesByLabel.keys()).sort();

  for (const label of sortedLabels) {
    newContent += `\n## 🏷️ ${label}\n\n`;
    const sortedIssues = issuesByLabel.get(label).sort((a, b) => a.number - b.number); // Sort issues by number
    for (const issue of sortedIssues) {
      newContent += `* [#${issue.number}](${issue.html_url}) ${issue.title}\n`;
    }
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf-8');
  const placeholderStartIndex = readmeContent.indexOf(placeholderStart);
  const placeholderEndIndex = readmeContent.indexOf(placeholderEnd);

  if (placeholderStartIndex === -1 || placeholderEndIndex === -1) {
    console.error('Placeholders not found in README.md. Exiting.');
    return;
  }

  const contentBefore = readmeContent.substring(0, placeholderStartIndex + placeholderStart.length);
  const contentAfter = readmeContent.substring(placeholderEndIndex);

  const updatedReadme = `${contentBefore}\n${newContent}\n${contentAfter}`;

  fs.writeFileSync(readmePath, updatedReadme);
  console.log('README.md has been updated successfully.');
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
```

### 步骤 5: 提交所有变更

将您刚刚创建和修改的所有文件 (`README.md`, `package.json`, `.github/workflows/update-readme.yml`, `.github/scripts/update-readme.js`) 提交到您的 GitHub 仓库。

```bash
git add .
git commit -m "feat: setup auto-update README workflow"
git push
```

完成以上步骤后，您的自动化工作流就配置完毕了。从现在开始，每当您在 GitHub 上创建、编辑、关闭或标记 Issue 时，机器人都会在几分钟内自动更新您的 `README.md` 文件。
