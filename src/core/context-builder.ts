import { loadGlobalPatterns, loadRepoKnowledge } from './knowledge.js';
import type { Issue, Comment } from '../types.js';

export interface ContextOptions {
  issue: Issue;
  repoPath?: string;
  includeComments?: boolean;
}

export function buildSystemPromptAdditions(options: ContextOptions): string {
  const parts: string[] = [];

  // Global patterns
  const patterns = loadGlobalPatterns();
  if (patterns) {
    parts.push('## Global Patterns\n' + patterns);
  }

  // Repo knowledge
  const knowledge = loadRepoKnowledge(options.repoPath);
  if (knowledge) {
    parts.push('## Repository Knowledge\n' + knowledge);
  }

  // Issue context
  parts.push(buildIssueContext(options.issue, options.includeComments ?? true));

  return parts.join('\n\n---\n\n');
}

export function buildIssuePrompt(issue: Issue): string {
  return `Work on GitHub issue #${issue.number}: ${issue.title}\n\n${issue.body || '(no description provided)'}\n\nPlease analyze this issue and implement the necessary changes. When you are done, explain what you did.`;
}

function buildIssueContext(issue: Issue, includeComments: boolean): string {
  const lines: string[] = [
    `## Issue Context`,
    `Issue #${issue.number}: ${issue.title}`,
    `State: ${issue.state}`,
    `Author: ${issue.author.login}`,
  ];

  if (issue.labels.length > 0) {
    lines.push(`Labels: ${issue.labels.map(l => l.name).join(', ')}`);
  }

  if (issue.assignees.length > 0) {
    lines.push(`Assignees: ${issue.assignees.map(a => a.login).join(', ')}`);
  }

  if (issue.milestone) {
    lines.push(`Milestone: ${issue.milestone.title}`);
  }

  if (issue.body) {
    lines.push('', '### Description', issue.body);
  }

  if (includeComments && issue.comments.length > 0) {
    lines.push('', '### Comments');
    for (const comment of issue.comments) {
      lines.push(`\n**${comment.author.login}** (${comment.createdAt}):\n${comment.body}`);
    }
  }

  return lines.join('\n');
}
