import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export type QualityGateMode = 'full' | 'code-only' | 'off';

export interface QualityCheckResult {
  pass: boolean;
  output: string;
  skipped: boolean;
}

export interface QualityGateResult {
  tests: QualityCheckResult;
  lint: QualityCheckResult;
  typecheck: QualityCheckResult;
  allPass: boolean;
  mode: QualityGateMode;
}

export class QualityGate {
  private mode: QualityGateMode;
  private cwd: string;

  constructor(mode: QualityGateMode = 'full', cwd?: string) {
    this.mode = mode;
    this.cwd = cwd ?? process.cwd();
  }

  async run(): Promise<QualityGateResult> {
    if (this.mode === 'off') {
      return this.createSkippedResult();
    }

    const lint = await this.runCommand('npm run lint');
    const typecheck = await this.runCommand('npm run typecheck');

    const tests = this.mode === 'full'
      ? await this.runCommand('npm test', 300000)
      : { pass: true, output: 'Skipped (code-only mode)', skipped: true };

    return {
      tests,
      lint,
      typecheck,
      allPass: lint.pass && typecheck.pass && tests.pass,
      mode: this.mode,
    };
  }

  private createSkippedResult(): QualityGateResult {
    const skipped = { pass: true, output: 'Skipped', skipped: true };
    return { tests: skipped, lint: skipped, typecheck: skipped, allPass: true, mode: 'off' };
  }

  private async runCommand(command: string, timeout = 60000): Promise<QualityCheckResult> {
    const [cmd, ...args] = command.split(' ');
    try {
      const { stdout, stderr } = await execFileAsync(cmd!, args, {
        encoding: 'utf-8',
        timeout,
        cwd: this.cwd,
        shell: true,
      });
      return { pass: true, output: stdout + stderr, skipped: false };
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string };
      return {
        pass: false,
        output: (execErr.stdout ?? '') + (execErr.stderr ?? ''),
        skipped: false,
      };
    }
  }
}
