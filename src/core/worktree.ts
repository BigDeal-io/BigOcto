import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { executeGitCommand } from './executor.js';
import { WORKTREE_DIR } from '../constants.js';
import type { Repository } from '../types.js';

export interface WorktreeSession {
  path: string;
  branch: string;
  repository: Repository;
}

export class WorktreeManager {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath ?? WORKTREE_DIR;
    if (!existsSync(this.basePath)) {
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  async create(repository: Repository, branchName: string): Promise<WorktreeSession> {
    const repoSlug = repository.fullName.replace('/', '-');
    const worktreePath = join(this.basePath, `${repoSlug}-${branchName}`);

    if (existsSync(worktreePath)) {
      await this.remove(worktreePath, repository.localPath);
    }

    const result = await executeGitCommand(
      ['worktree', 'add', '-b', branchName, worktreePath],
      repository.localPath,
    );

    if (result.exitCode !== 0) {
      // Branch might already exist, try without -b
      const result2 = await executeGitCommand(
        ['worktree', 'add', worktreePath, branchName],
        repository.localPath,
      );
      if (result2.exitCode !== 0) {
        throw new Error(`Failed to create worktree: ${result2.stderr}`);
      }
    }

    return { path: worktreePath, branch: branchName, repository };
  }

  async remove(worktreePath: string, repoPath?: string): Promise<void> {
    try {
      if (repoPath) {
        await executeGitCommand(['worktree', 'remove', worktreePath, '--force'], repoPath);
      }
      if (existsSync(worktreePath)) {
        rmSync(worktreePath, { recursive: true, force: true });
      }
    } catch {
      // Cleanup is best-effort
    }
  }

  async list(repoPath: string): Promise<string[]> {
    const result = await executeGitCommand(['worktree', 'list'], repoPath);
    if (result.exitCode !== 0) return [];
    return result.stdout.trim().split('\n').filter(Boolean);
  }

  async cleanupAll(repoPath: string): Promise<void> {
    const worktrees = await this.list(repoPath);
    for (const line of worktrees) {
      if (line.includes('.bigocto/worktrees/')) {
        const path = line.split(' ')[0]!;
        await this.remove(path, repoPath);
      }
    }
  }
}
