import type { Issue, Repository, IterationResult } from '../types.js';
import { WorktreeManager, type WorktreeSession } from './worktree.js';
import { QualityGate, type QualityGateMode } from './quality-gate.js';
import { ProgressTracker } from './progress-tracker.js';
import { LoopCoordinator } from './loop-coordinator.js';
import { buildLoopSystemPromptAdditions, buildLoopIterationPrompt, checkExitSignal } from './loop-context.js';
import { executeGitCommand } from './executor.js';
import { logSession } from './knowledge.js';
import { addHistoryEntry } from './history.js';

export interface LoopConfig {
  issue: Issue;
  repository: Repository;
  maxIterations: number;
  model: string;
  qualityGateMode: QualityGateMode;
  useWorktree: boolean;
  sleepBetweenIterations: number;
}

export interface LoopProgress {
  iteration: number;
  maxIterations: number;
  status: 'setup' | 'running' | 'quality-gate' | 'committing' | 'complete' | 'error' | 'stopped';
  lastResult?: IterationResult;
  message: string;
}

export class LoopManager {
  private worktreeManager = new WorktreeManager();
  private coordinator = new LoopCoordinator();
  private stopped = false;

  async *run(config: LoopConfig): AsyncGenerator<LoopProgress> {
    const repoSlug = config.repository.fullName.replace('/', '-');
    const branchName = `issue-${config.issue.number}-${slugify(config.issue.title)}`;

    // Check for conflicts
    const conflict = this.coordinator.checkConflict(config.issue.number, repoSlug);
    if (conflict) {
      yield {
        iteration: 0, maxIterations: config.maxIterations,
        status: 'error',
        message: `Issue #${config.issue.number} already being processed (PID ${conflict.pid})`,
      };
      return;
    }

    let workDir = process.cwd();
    let worktreeSession: WorktreeSession | undefined;

    try {
      // Setup phase
      yield { iteration: 0, maxIterations: config.maxIterations, status: 'setup', message: 'Setting up...' };

      if (config.useWorktree && config.repository.localPath) {
        worktreeSession = await this.worktreeManager.create(config.repository, branchName);
        workDir = worktreeSession.path;
        yield { iteration: 0, maxIterations: config.maxIterations, status: 'setup', message: `Worktree created at ${workDir}` };
      } else {
        // Create branch in current directory
        await executeGitCommand(['checkout', '-b', branchName], workDir);
      }

      this.coordinator.createLock(config.issue.number, repoSlug, workDir);

      const progressTracker = new ProgressTracker(workDir, config.issue.number);
      progressTracker.initialize(config.issue.number, config.issue.title, config.issue.body);

      logSession({
        repository: config.repository.fullName,
        issueNumber: config.issue.number,
        action: 'Started loop',
        details: `Max iterations: ${config.maxIterations}, Model: ${config.model}, Mode: ${config.qualityGateMode}`,
      });

      // Iteration loop
      for (let i = 1; i <= config.maxIterations; i++) {
        if (this.stopped) {
          yield { iteration: i, maxIterations: config.maxIterations, status: 'stopped', message: 'Loop stopped by user' };
          break;
        }

        yield { iteration: i, maxIterations: config.maxIterations, status: 'running', message: `Iteration ${i}/${config.maxIterations} - Launching agent...` };

        // Read progress
        const progressContent = progressTracker.read();

        // Build context
        const systemPrompt = buildLoopSystemPromptAdditions({
          issue: config.issue,
          repoPath: config.repository.localPath,
          progressContent,
          iteration: i,
        });

        const prompt = buildLoopIterationPrompt(config.issue, i);

        // Run agent
        let agentOutput = '';
        let exitSignal = false;

        try {
          // @ts-ignore - SDK is an optional dependency
          const { query } = await import('@anthropic-ai/claude-agent-sdk');

          const q = query({
            prompt,
            options: {
              model: config.model,
              maxTurns: 50,
              cwd: workDir,
              allowedTools: ['Read', 'Edit', 'Write', 'Bash', 'Glob', 'Grep'],
              appendSystemPrompt: systemPrompt,
              permissionMode: 'bypassPermissions',
            },
          });

          for await (const message of q) {
            if (message.type === 'assistant' && message.message) {
              const textContent = message.message.content.find((c: any) => c.type === 'text');
              if (textContent && 'text' in textContent) {
                agentOutput += textContent.text + '\n';
              }
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          yield {
            iteration: i, maxIterations: config.maxIterations,
            status: 'error',
            message: `Agent error: ${errMsg}`,
          };
          break;
        }

        exitSignal = checkExitSignal(agentOutput);

        // Quality gate
        yield { iteration: i, maxIterations: config.maxIterations, status: 'quality-gate', message: 'Running quality gates...' };

        const qualityGate = new QualityGate(config.qualityGateMode, workDir);
        const qgResult = await qualityGate.run();

        const iterResult: IterationResult = {
          iteration: i,
          success: qgResult.allPass,
          testsPass: qgResult.tests.pass,
          lintPass: qgResult.lint.pass,
          typecheckPass: qgResult.typecheck.pass,
          learnings: [],
          complete: exitSignal,
          exitSignal,
        };

        // Commit if quality gates pass
        if (qgResult.allPass) {
          yield { iteration: i, maxIterations: config.maxIterations, status: 'committing', message: 'Committing changes...' };

          await executeGitCommand(['add', '-A'], workDir);
          const commitResult = await executeGitCommand(
            ['commit', '-m', `bigocto: issue #${config.issue.number} iteration ${i}`, '--allow-empty'],
            workDir,
          );

          if (commitResult.exitCode === 0) {
            const hashResult = await executeGitCommand(['rev-parse', '--short', 'HEAD'], workDir);
            iterResult.commitHash = hashResult.stdout.trim();
          }
        }

        progressTracker.appendIteration(iterResult);

        yield {
          iteration: i, maxIterations: config.maxIterations,
          status: exitSignal ? 'complete' : 'running',
          lastResult: iterResult,
          message: exitSignal
            ? `Issue completed at iteration ${i}!`
            : `Iteration ${i} done. ${qgResult.allPass ? 'Quality gates passed.' : 'Quality gates failed.'}`,
        };

        if (exitSignal) break;

        // Sleep between iterations
        if (i < config.maxIterations && config.sleepBetweenIterations > 0) {
          await new Promise(resolve => setTimeout(resolve, config.sleepBetweenIterations));
        }
      }

      addHistoryEntry({
        action: 'Loop completed',
        detail: `Issue #${config.issue.number}`,
        success: true,
        repository: config.repository.fullName,
      });

    } finally {
      this.coordinator.removeLock(config.issue.number, repoSlug);
      // Don't auto-remove worktree — user should inspect the branch
    }
  }

  stop(): void {
    this.stopped = true;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}
