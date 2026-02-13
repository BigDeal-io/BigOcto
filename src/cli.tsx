import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { App } from './app.js';
import { detectGitEnvironment } from './core/git.js';
import { APP_AUTHOR, APP_AUTHOR_URL, APP_COMPANY, APP_NAME, APP_VERSION } from './constants.js';

const program = new Command();

program
  .name(APP_NAME)
  .description('BIGOCTO \u2014 GitHub issues, the easy way')
  .version(APP_VERSION, '-v, --version')
  .addHelpText('after', `\nA product of ${APP_AUTHOR} \u2014 a service of ${APP_COMPANY}\n${APP_AUTHOR_URL}`);

program.action(async () => {
  const env = await detectGitEnvironment();

  const { waitUntilExit } = render(<App env={env} />, {
    exitOnCtrlC: true,
  });

  await waitUntilExit();
  process.exit(0);
});

program
  .command('loop')
  .description('Run autonomous loop mode on a GitHub issue')
  .requiredOption('-i, --issue <number>', 'GitHub issue number')
  .option('-m, --model <model>', 'Claude model to use', 'claude-sonnet-4-5-20250929')
  .option('-n, --max-iterations <n>', 'Maximum iterations', '20')
  .option('--no-worktree', 'Use current folder instead of worktree')
  .option('-q, --quality-gate <mode>', 'Quality gate mode: full, code-only, off', 'code-only')
  .action(async (opts) => {
    const { LoopManager } = await import('./core/loop-manager.js');
    const { executeGhCommand } = await import('./core/executor.js');
    const { buildViewIssue, parseIssueDetail } = await import('./core/github.js');
    const { loadConfig } = await import('./core/config.js');

    const env = await detectGitEnvironment();
    if (!env.repository) {
      console.error('Error: Not in a git repository with a GitHub remote.');
      process.exit(1);
    }

    const config = loadConfig();
    const issueNumber = parseInt(opts.issue, 10);

    // Fetch issue
    const args = buildViewIssue(env.repository.fullName, issueNumber);
    const result = await executeGhCommand(args);
    if (result.exitCode !== 0) {
      console.error(`Failed to fetch issue #${issueNumber}: ${result.stderr}`);
      process.exit(1);
    }

    const issue = parseIssueDetail(result.stdout);
    if (!issue) {
      console.error(`Failed to parse issue #${issueNumber}`);
      process.exit(1);
    }
    console.log(`Starting loop on issue #${issue.number}: ${issue.title}`);

    const manager = new LoopManager();
    const qualityGateMode = opts.qualityGate as 'full' | 'code-only' | 'off';

    process.on('SIGINT', () => {
      console.log('\nStopping loop...');
      manager.stop();
    });

    for await (const progress of manager.run({
      issue,
      repository: env.repository,
      maxIterations: parseInt(opts.maxIterations, 10),
      model: opts.model,
      qualityGateMode,
      useWorktree: opts.worktree !== false,
      sleepBetweenIterations: config.loop.sleep_between_iterations,
    })) {
      const prefix = `[${progress.iteration}/${progress.maxIterations}]`;
      console.log(`${prefix} ${progress.status}: ${progress.message}`);

      if (progress.lastResult) {
        const r = progress.lastResult;
        console.log(`  Tests: ${r.testsPass ? 'PASS' : 'FAIL'} | Lint: ${r.lintPass ? 'PASS' : 'FAIL'} | Types: ${r.typecheckPass ? 'PASS' : 'FAIL'}${r.commitHash ? ` | Commit: ${r.commitHash}` : ''}`);
      }
    }

    console.log('Loop finished.');
    process.exit(0);
  });

program.parse();
