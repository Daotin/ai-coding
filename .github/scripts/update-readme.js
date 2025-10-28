const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const startMarker = '<!-- ISSUES-LIST:START -->';
const endMarker = '<!-- ISSUES-LIST:END -->';
const noticeLine = '<!-- 此列表由 GitHub Actions 自动生成，请勿手动修改 -->';
const readmePath = path.resolve(process.cwd(), 'README.md');

function ensureEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`环境变量 ${name} 未设置，无法更新 README。`);
    process.exit(1);
  }
  return value;
}

function ensureGroup(container, label) {
  if (!container.has(label)) {
    container.set(label, []);
  }
  return container.get(label);
}

async function fetchOpenIssues(octokit, owner, repo) {
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });
  return issues.filter((issue) => !issue.pull_request);
}

function buildIssueSections(issuesByLabel) {
  const sortedLabels = Array.from(issuesByLabel.keys()).sort((a, b) =>
    a.localeCompare(b, 'zh-Hans', { sensitivity: 'base' }),
  );

  const lines = ['', noticeLine];

  for (const label of sortedLabels) {
    lines.push('', `## ${label}`, '');

    const sortedIssues = issuesByLabel
      .get(label)
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    for (const issue of sortedIssues) {
      lines.push(`* [${issue.title}](${issue.html_url})`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function updateReadme(sectionContent) {
  if (!fs.existsSync(readmePath)) {
    console.error('README.md 文件不存在，无法更新。');
    process.exit(1);
  }

  const original = fs.readFileSync(readmePath, 'utf-8');
  const startIndex = original.indexOf(startMarker);
  const endIndex = original.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.error('README.md 中未找到有效的占位符，无法更新。');
    process.exit(1);
  }

  const before = original.slice(0, startIndex + startMarker.length);
  const after = original.slice(endIndex);
  const nextContent = `${before}${sectionContent}${after}`;

  if (nextContent === original) {
    console.log('README.md 内容无变化。');
    return false;
  }

  fs.writeFileSync(readmePath, nextContent);
  return true;
}

async function main() {
  const token = ensureEnv('GITHUB_TOKEN');
  const owner = ensureEnv('REPO_OWNER');
  const repo = ensureEnv('REPO_NAME');

  const octokit = new Octokit({ auth: token });
  console.log(`开始更新 ${owner}/${repo} 的 README 目录。`);

  const issues = await fetchOpenIssues(octokit, owner, repo);
  console.log(`获取到 ${issues.length} 个开启的 Issue。`);

  const issuesByLabel = new Map();

  for (const issue of issues) {
    const labels = issue.labels?.map((label) => label.name).filter(Boolean) || [];

    if (labels.length === 0) {
      ensureGroup(issuesByLabel, '未分类').push(issue);
      continue;
    }

    for (const label of labels) {
      ensureGroup(issuesByLabel, label).push(issue);
    }
  }

  const sectionContent = buildIssueSections(issuesByLabel);
  const didUpdate = updateReadme(sectionContent);

  if (didUpdate) {
    console.log('README.md 更新完成。');
  }
}

main().catch((error) => {
  console.error('更新流程出错：', error);
  process.exit(1);
});
