const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const startMarker = '<!-- ISSUES-LIST:START -->';
const endMarker = '<!-- ISSUES-LIST:END -->';
const noticeLine = '<!-- 此列表由 GitHub Actions 自动生成，请勿手动修改 -->';
const timestampMarker = '<!-- UPDATED_AT -->';
const readmePath = path.resolve(process.cwd(), 'README.md');
const backupDir = path.resolve(process.cwd(), 'BACKUP');

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

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }
  const iso = new Date(dateString).toISOString();
  return iso.slice(0, 10);
}

function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
  const sortedLabels = Array.from(issuesByLabel.keys()).sort((a, b) => a.localeCompare(b, 'zh-Hans', { sensitivity: 'base' }));

  const lines = ['', noticeLine];

  for (const label of sortedLabels) {
    lines.push('', `## ${label}`, '');

    const sortedIssues = issuesByLabel
      .get(label)
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    for (const issue of sortedIssues) {
      lines.push(`* [${issue.title}](${issue.html_url}) (${formatDate(issue.created_at)})`);
      const todos = extractIssueTodos(issue.body);
      for (const todo of todos) {
        lines.push(`  - [ ] ${todo}`);
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}

function ensureBackupDir() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

function resetBackupDir() {
  if (fs.existsSync(backupDir)) {
    const entries = fs.readdirSync(backupDir);
    for (const entry of entries) {
      const target = path.join(backupDir, entry);
      try {
        fs.rmSync(target, { recursive: true, force: true });
      } catch (error) {
        console.warn(`清理备份目录 ${target} 时出错。`, error);
      }
    }
  } else {
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

function buildBackupFilename(issue) {
  const collapsedTitle = issue.title ? issue.title.replace(/\s+/g, '') : '';
  return `issue-${issue.number}-${collapsedTitle || 'untitled'}.md`;
}

function buildIssueBackupContent(issue) {
  const tags = (issue.labels || []).map((label) => label.name).filter(Boolean);
  const yamlFrontMatter = [
    '---',
    'layout: post',
    `title: "${issue.title.replace(/"/g, '\\"')}"`,
    `date: ${formatDate(issue.created_at)}`,
    `tags: [${tags.join(', ')}]`,
    '---',
    '',
  ];

  const body = issue.body ? issue.body : '_无正文_';
  return `${yamlFrontMatter.join('\n')}${body}\n`;
}

function extractIssueTodos(body) {
  if (!body) {
    return [];
  }

  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^-\s*\[\s\]\s+/.test(line))
    .map((line) => line.replace(/^-\s*\[\s\]\s+/, '').trim())
    .filter(Boolean);
}

function syncIssueBackup(issues) {
  resetBackupDir();
  ensureBackupDir();

  for (const issue of issues) {
    const filename = buildBackupFilename(issue);
    const filePath = path.join(backupDir, filename);
    const nextContent = buildIssueBackupContent(issue);

    fs.writeFileSync(filePath, nextContent, 'utf-8');
  }
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
  let nextContent = `${before}${sectionContent}${after}`;

  // 更新时间戳
  const timestamp = formatTimestamp();
  const timestampRegex = new RegExp(`${timestampMarker}\\s*\\*updated:\\s*[\\d-]+\\s*[\\d:]*\\*\\s*${timestampMarker}`);
  const newTimestamp = `${timestampMarker} *updated: ${timestamp}* ${timestampMarker}`;

  if (timestampRegex.test(nextContent)) {
    nextContent = nextContent.replace(timestampRegex, newTimestamp);
  }

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

  syncIssueBackup(issues);

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
