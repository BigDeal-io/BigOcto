import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import type { IterationResult } from '../types.js';

export class ProgressTracker {
  private filePath: string;

  constructor(workDir: string, issueNumber: number) {
    const dir = join(workDir, '.bigocto');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    this.filePath = join(dir, 'progress.txt');
  }

  read(): string {
    try {
      if (!existsSync(this.filePath)) return '';
      return readFileSync(this.filePath, 'utf-8');
    } catch {
      return '';
    }
  }

  initialize(issueNumber: number, issueTitle: string, issueBody: string): void {
    const content = `# BIGOCTO Progress - Issue #${issueNumber}

Started: ${new Date().toISOString()}

## Issue Context
${issueTitle}

${issueBody?.slice(0, 500) ?? ''}

## Learnings
(Accumulated patterns from iterations)

`;
    writeFileSync(this.filePath, content);
  }

  appendIteration(result: IterationResult): void {
    const existing = this.read();
    const timestamp = new Date().toLocaleString();
    const status = result.complete ? 'COMPLETE' : result.success ? 'Pass' : 'In Progress';

    const entry = `
---

## Iteration ${result.iteration} - ${timestamp}

**Status:** ${status}
**Tests:** ${result.testsPass ? 'Pass' : 'Fail'}
**Lint:** ${result.lintPass ? 'Pass' : 'Fail'}
**Typecheck:** ${result.typecheckPass ? 'Pass' : 'Fail'}
**Commit:** ${result.commitHash ?? 'None'}

### Learnings
${result.learnings.map(l => `- ${l}`).join('\n') || '(none)'}
`;

    writeFileSync(this.filePath, existing + entry);
  }
}
