import type { Issue, Label, Milestone, Comment, User } from '../types.js';

// ── Issue command builders ─────────────────────────────────────────────

const ISSUE_JSON_FIELDS = 'number,title,body,state,labels,assignees,milestone,comments,createdAt,updatedAt,url,author';

export function buildListIssues(repo: string, options?: {
  state?: 'open' | 'closed' | 'all';
  assignee?: string;
  labels?: string[];
  milestone?: string;
  limit?: number;
}): string[] {
  const args = ['issue', 'list', '-R', repo, '--json', ISSUE_JSON_FIELDS];
  if (options?.state) args.push('--state', options.state);
  if (options?.assignee) args.push('--assignee', options.assignee);
  if (options?.labels?.length) args.push('--label', options.labels.join(','));
  if (options?.milestone) args.push('--milestone', options.milestone);
  args.push('--limit', String(options?.limit ?? 50));
  return args;
}

export function buildViewIssue(repo: string, issueNumber: number): string[] {
  return ['issue', 'view', String(issueNumber), '-R', repo, '--json', ISSUE_JSON_FIELDS];
}

export function buildCreateIssue(repo: string, options: {
  title: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  milestone?: string;
}): string[] {
  const args = ['issue', 'create', '-R', repo, '--title', options.title];
  if (options.body) args.push('--body', options.body);
  if (options.labels?.length) args.push('--label', options.labels.join(','));
  if (options.assignees?.length) args.push('--assignee', options.assignees.join(','));
  if (options.milestone) args.push('--milestone', options.milestone);
  return args;
}

export function buildCloseIssue(repo: string, issueNumber: number): string[] {
  return ['issue', 'close', String(issueNumber), '-R', repo];
}

export function buildReopenIssue(repo: string, issueNumber: number): string[] {
  return ['issue', 'reopen', String(issueNumber), '-R', repo];
}

export function buildAddComment(repo: string, issueNumber: number, body: string): string[] {
  return ['issue', 'comment', String(issueNumber), '-R', repo, '--body', body];
}

export function buildEditIssue(repo: string, issueNumber: number, options: {
  title?: string;
  body?: string;
  addLabels?: string[];
  removeLabels?: string[];
  addAssignees?: string[];
  removeAssignees?: string[];
  milestone?: string;
}): string[] {
  const args = ['issue', 'edit', String(issueNumber), '-R', repo];
  if (options.title) args.push('--title', options.title);
  if (options.body) args.push('--body', options.body);
  if (options.addLabels?.length) args.push('--add-label', options.addLabels.join(','));
  if (options.removeLabels?.length) args.push('--remove-label', options.removeLabels.join(','));
  if (options.addAssignees?.length) args.push('--add-assignee', options.addAssignees.join(','));
  if (options.removeAssignees?.length) args.push('--remove-assignee', options.removeAssignees.join(','));
  if (options.milestone) args.push('--milestone', options.milestone);
  return args;
}

export function buildListLabels(repo: string): string[] {
  return ['label', 'list', '-R', repo, '--json', 'name,color,description'];
}

export function buildListMilestones(repo: string): string[] {
  return ['api', `repos/${repo}/milestones`, '--jq', '.[].title'];
}

export function buildOpenInBrowser(repo: string, issueNumber: number): string[] {
  return ['issue', 'view', String(issueNumber), '-R', repo, '--web'];
}

// ── Output parsers ─────────────────────────────────────────────────────

export function parseIssueList(json: string): Issue[] {
  try {
    const raw = JSON.parse(json) as RawIssue[];
    return raw.map(parseRawIssue);
  } catch {
    return [];
  }
}

export function parseIssueDetail(json: string): Issue | null {
  try {
    const raw = JSON.parse(json) as RawIssue;
    return parseRawIssue(raw);
  } catch {
    return null;
  }
}

export function parseLabelList(json: string): Label[] {
  try {
    return JSON.parse(json) as Label[];
  } catch {
    return [];
  }
}

export function parseMilestoneList(output: string): string[] {
  if (!output.trim()) return [];
  return output.trim().split('\n').filter(Boolean);
}

// ── Internal types for raw gh JSON ─────────────────────────────────────

interface RawIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  labels: Array<{ name: string; color: string; description?: string }>;
  assignees: Array<{ login: string; name?: string }>;
  milestone?: { title: string; number: number; state: string; dueOn?: string } | null;
  comments: Array<{ id: number; body: string; author: { login: string }; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
  url: string;
  author: { login: string; name?: string };
}

function parseRawIssue(raw: RawIssue): Issue {
  return {
    number: raw.number,
    title: raw.title,
    body: raw.body ?? '',
    state: raw.state === 'OPEN' ? 'OPEN' : 'CLOSED',
    labels: (raw.labels ?? []).map(l => ({
      name: l.name,
      color: l.color,
      description: l.description,
    })),
    assignees: (raw.assignees ?? []).map(a => ({
      login: a.login,
      name: a.name,
    })),
    milestone: raw.milestone ? {
      title: raw.milestone.title,
      number: raw.milestone.number,
      state: raw.milestone.state,
      dueOn: raw.milestone.dueOn,
    } : undefined,
    comments: (raw.comments ?? []).map(c => ({
      id: c.id,
      body: c.body,
      author: { login: c.author.login },
      createdAt: c.createdAt,
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    url: raw.url,
    author: { login: raw.author.login, name: raw.author.name },
  };
}
