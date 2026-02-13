import type { Issue } from '../types.js';
import { loadGlobalPatterns, loadRepoKnowledge } from './knowledge.js';

export function buildLoopSystemPromptAdditions(options: {
  issue: Issue;
  repoPath?: string;
  progressContent: string;
  iteration: number;
}): string {
  const parts: string[] = [];

  const patterns = loadGlobalPatterns();
  if (patterns) {
    parts.push('## Global Patterns\n' + patterns);
  }

  const knowledge = loadRepoKnowledge(options.repoPath);
  if (knowledge) {
    parts.push('## Repository Knowledge\n' + knowledge);
  }

  parts.push(`## Issue Context
Issue #${options.issue.number}: ${options.issue.title}
${options.issue.body ?? ''}
`);

  if (options.progressContent) {
    parts.push(`## Progress from Previous Iterations\n${options.progressContent}`);
  }

  parts.push(`## Loop Mode Instructions
This is iteration ${options.iteration} of an autonomous loop.
- Read the progress file above to understand what has been done so far.
- Continue working on the issue from where the previous iteration left off.
- When the issue is fully resolved and all requirements are met, output exactly:
  <EXIT_SIGNAL>COMPLETE</EXIT_SIGNAL>
- Do NOT output the exit signal unless you are confident the work is done.
- Focus on making incremental progress each iteration.
`);

  return parts.join('\n\n---\n\n');
}

export function buildLoopIterationPrompt(issue: Issue, iteration: number): string {
  return `Continue working on GitHub issue #${issue.number}: ${issue.title}

This is iteration ${iteration}. Read progress.txt to see what was done in previous iterations, then continue the work.

When the issue is fully resolved, output: <EXIT_SIGNAL>COMPLETE</EXIT_SIGNAL>`;
}

export function checkExitSignal(text: string): boolean {
  return text.includes('<EXIT_SIGNAL>COMPLETE</EXIT_SIGNAL>');
}
