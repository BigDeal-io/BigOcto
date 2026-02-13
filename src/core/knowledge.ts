import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { PATTERNS_FILE, SESSIONS_DIR } from '../constants.js';

export function loadGlobalPatterns(): string {
  try {
    if (!existsSync(PATTERNS_FILE)) return '';
    return readFileSync(PATTERNS_FILE, 'utf-8');
  } catch {
    return '';
  }
}

export function loadRepoKnowledge(repoPath?: string): string {
  if (!repoPath) return '';
  try {
    const claudeMdPath = join(repoPath, '.bigocto', 'CLAUDE.md');
    if (!existsSync(claudeMdPath)) return '';
    return readFileSync(claudeMdPath, 'utf-8');
  } catch {
    return '';
  }
}

export function logSession(entry: {
  repository: string;
  issueNumber: number;
  action: string;
  details: string;
}): void {
  try {
    if (!existsSync(SESSIONS_DIR)) {
      mkdirSync(SESSIONS_DIR, { recursive: true });
    }
    const date = new Date().toISOString().split('T')[0];
    const logFile = join(SESSIONS_DIR, `${date}.txt`);
    const timestamp = new Date().toLocaleTimeString();
    const line = `\n## Session: ${timestamp}\n${entry.action} Issue #${entry.issueNumber} (${entry.repository})\n${entry.details}\n`;

    if (existsSync(logFile)) {
      const existing = readFileSync(logFile, 'utf-8');
      writeFileSync(logFile, existing + line);
    } else {
      const header = `# BIGOCTO Session Progress - ${date}\n`;
      writeFileSync(logFile, header + line);
    }
  } catch {
    // Session logging is best-effort
  }
}
