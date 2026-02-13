import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';
import { LOCKS_DIR } from '../constants.js';

interface LockInfo {
  pid: number;
  started: string;
  issue: number;
  repository: string;
  worktree?: string;
}

export class LoopCoordinator {
  private lockDir: string;

  constructor() {
    this.lockDir = LOCKS_DIR;
    if (!existsSync(this.lockDir)) {
      mkdirSync(this.lockDir, { recursive: true });
    }
  }

  checkConflict(issue: number, repoSlug: string): LockInfo | null {
    const lockFile = join(this.lockDir, `${repoSlug}-issue-${issue}.lock`);
    if (!existsSync(lockFile)) return null;

    try {
      const lock = JSON.parse(readFileSync(lockFile, 'utf-8')) as LockInfo;
      if (this.isProcessRunning(lock.pid)) {
        return lock;
      }
      // Stale lock
      unlinkSync(lockFile);
      return null;
    } catch {
      return null;
    }
  }

  createLock(issue: number, repoSlug: string, worktreePath?: string): void {
    const lockFile = join(this.lockDir, `${repoSlug}-issue-${issue}.lock`);
    const lock: LockInfo = {
      pid: process.pid,
      started: new Date().toISOString(),
      issue,
      repository: repoSlug,
      worktree: worktreePath,
    };
    writeFileSync(lockFile, JSON.stringify(lock, null, 2));
  }

  removeLock(issue: number, repoSlug: string): void {
    const lockFile = join(this.lockDir, `${repoSlug}-issue-${issue}.lock`);
    if (existsSync(lockFile)) {
      unlinkSync(lockFile);
    }
  }

  getActiveLocks(): LockInfo[] {
    try {
      const files = readdirSync(this.lockDir).filter(f => f.endsWith('.lock'));
      const locks: LockInfo[] = [];
      for (const file of files) {
        try {
          const lock = JSON.parse(readFileSync(join(this.lockDir, file), 'utf-8')) as LockInfo;
          if (this.isProcessRunning(lock.pid)) {
            locks.push(lock);
          } else {
            unlinkSync(join(this.lockDir, file));
          }
        } catch {
          // Skip invalid locks
        }
      }
      return locks;
    } catch {
      return [];
    }
  }

  private isProcessRunning(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }
}
