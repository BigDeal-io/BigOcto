import { executeGitCommand, executeGhCommand } from './executor.js';
import type { GitEnvironment, Repository } from '../types.js';

export async function detectGitEnvironment(): Promise<GitEnvironment> {
  const isGitRepo = await checkIsGitRepo();
  if (!isGitRepo) {
    const ghAuth = await checkGhAuth();
    return { isGitRepo: false, ghAuthenticated: ghAuth };
  }

  const repository = await detectRepository();
  const ghAuth = await checkGhAuth();
  const currentBranch = await getCurrentBranch();

  return {
    isGitRepo: true,
    repository: repository ?? undefined,
    ghAuthenticated: ghAuth,
    currentBranch: currentBranch ?? undefined,
  };
}

async function checkIsGitRepo(): Promise<boolean> {
  const result = await executeGitCommand(['rev-parse', '--is-inside-work-tree']);
  return result.exitCode === 0 && result.stdout.trim() === 'true';
}

async function detectRepository(): Promise<Repository | null> {
  const result = await executeGitCommand(['remote', 'get-url', 'origin']);
  if (result.exitCode !== 0 || !result.stdout.trim()) return null;

  const url = result.stdout.trim();
  return parseGitRemoteUrl(url);
}

async function getCurrentBranch(): Promise<string | null> {
  const result = await executeGitCommand(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (result.exitCode !== 0) return null;
  return result.stdout.trim();
}

async function checkGhAuth(): Promise<boolean> {
  const result = await executeGhCommand(['auth', 'status']);
  return result.exitCode === 0;
}

export function parseGitRemoteUrl(url: string): Repository | null {
  // SSH: git@github.com:owner/repo.git
  const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return {
      owner: sshMatch[1]!,
      name: sshMatch[2]!,
      fullName: `${sshMatch[1]}/${sshMatch[2]}`,
    };
  }

  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = url.match(/https?:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return {
      owner: httpsMatch[1]!,
      name: httpsMatch[2]!,
      fullName: `${httpsMatch[1]}/${httpsMatch[2]}`,
    };
  }

  return null;
}
