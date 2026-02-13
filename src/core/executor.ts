import { execFile } from 'child_process';
import { promisify } from 'util';
import type { CommandResult } from '../types.js';

const execFileAsync = promisify(execFile);

export async function executeGhCommand(args: string[]): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execFileAsync('gh', args, {
      encoding: 'utf-8',
      timeout: 30000,
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      const execErr = err as { code: number | string | null; stdout: string | Buffer; stderr: string | Buffer };
      return {
        stdout: String(execErr.stdout ?? ''),
        stderr: String(execErr.stderr ?? ''),
        exitCode: typeof execErr.code === 'number' ? execErr.code : 1,
      };
    }
    return {
      stdout: '',
      stderr: err instanceof Error ? err.message : String(err),
      exitCode: 1,
    };
  }
}

export async function executeGitCommand(args: string[], cwd?: string): Promise<CommandResult> {
  try {
    const { stdout, stderr } = await execFileAsync('git', args, {
      encoding: 'utf-8',
      timeout: 10000,
      cwd,
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      const execErr = err as { code: number | string | null; stdout: string | Buffer; stderr: string | Buffer };
      return {
        stdout: String(execErr.stdout ?? ''),
        stderr: String(execErr.stderr ?? ''),
        exitCode: typeof execErr.code === 'number' ? execErr.code : 1,
      };
    }
    return {
      stdout: '',
      stderr: err instanceof Error ? err.message : String(err),
      exitCode: 1,
    };
  }
}
