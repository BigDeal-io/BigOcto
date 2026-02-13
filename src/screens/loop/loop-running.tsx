import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { LoopManager, type LoopConfig, type LoopProgress } from '../../core/loop-manager.js';
import { LoadingSpinner } from '../../components/loading-spinner.js';
import { COLORS } from '../../constants.js';
import type { GitEnvironment, Issue } from '../../types.js';
import type { LoopLaunchConfig } from './loop-config.js';
import { executeGhCommand } from '../../core/executor.js';
import { parseIssueDetail, buildViewIssue } from '../../core/github.js';

interface LoopRunningProps {
  launchConfig: LoopLaunchConfig;
  onBack: () => void;
  env: GitEnvironment;
}

export function LoopRunning({ launchConfig, onBack, env }: LoopRunningProps) {
  const [progress, setProgress] = useState<LoopProgress | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stopped, setStopped] = useState(false);
  const managerRef = useRef<LoopManager | null>(null);
  const startedRef = useRef(false);

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      if (progress?.status === 'complete' || progress?.status === 'error' || progress?.status === 'stopped') {
        onBack();
      }
    }
    if (input === 's' && progress?.status === 'running') {
      if (managerRef.current) {
        managerRef.current.stop();
        setStopped(true);
      }
    }
  });

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const repo = env.repository;
    if (!repo) {
      setError('No repository detected');
      return;
    }

    async function runLoop() {
      // Fetch issue data first
      const args = buildViewIssue(repo!.fullName, launchConfig.issueNumber);
      const result = await executeGhCommand(args);
      if (result.exitCode !== 0) {
        setError(`Failed to fetch issue #${launchConfig.issueNumber}: ${result.stderr}`);
        return;
      }

      const issue = parseIssueDetail(result.stdout);
      if (!issue) {
        setError(`Failed to parse issue #${launchConfig.issueNumber}`);
        return;
      }

      const loopConfig: LoopConfig = {
        issue,
        repository: repo!,
        maxIterations: launchConfig.maxIterations,
        model: launchConfig.model,
        qualityGateMode: launchConfig.qualityGateMode,
        useWorktree: launchConfig.useWorktree,
        sleepBetweenIterations: launchConfig.sleepBetweenIterations,
      };

      const manager = new LoopManager();
      managerRef.current = manager;

      try {
        for await (const p of manager.run(loopConfig)) {
          setProgress(p);
          setLog(prev => [...prev.slice(-30), p.message]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    runLoop();
  }, []);

  if (error) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.error}>Loop Error</Text>
        <Text color={COLORS.error}>{error}</Text>
        <Text color={COLORS.muted}>Press Esc to go back.</Text>
      </Box>
    );
  }

  if (!progress) {
    return <LoadingSpinner label="Starting loop..." />;
  }

  const isRunning = progress.status === 'running' || progress.status === 'setup' ||
    progress.status === 'quality-gate' || progress.status === 'committing';
  const isDone = progress.status === 'complete' || progress.status === 'error' || progress.status === 'stopped';

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>
        Loop Mode - Issue #{launchConfig.issueNumber}
      </Text>

      {/* Status bar */}
      <Box flexDirection="column">
        <Text color={COLORS.text}>
          Status: <Text bold color={statusColor(progress.status)}>{progress.status.toUpperCase()}</Text>
        </Text>
        <Text color={COLORS.text}>
          Iteration: <Text bold>{progress.iteration}</Text> / {progress.maxIterations}
        </Text>
        {progress.lastResult && (
          <Box flexDirection="column">
            <Text color={COLORS.text}>
              Tests: {passLabel(progress.lastResult.testsPass)}{' '}
              Lint: {passLabel(progress.lastResult.lintPass)}{' '}
              Types: {passLabel(progress.lastResult.typecheckPass)}
            </Text>
            {progress.lastResult.commitHash && (
              <Text color={COLORS.text}>Last commit: <Text bold>{progress.lastResult.commitHash}</Text></Text>
            )}
          </Box>
        )}
      </Box>

      {/* Progress log */}
      <Box flexDirection="column" borderStyle="single" borderColor={COLORS.border} paddingX={1}>
        {log.slice(-10).map((line, i) => (
          <Text key={i} color={COLORS.muted}>{line}</Text>
        ))}
        {log.length === 0 && <Text color={COLORS.muted}>Waiting for progress...</Text>}
      </Box>

      {/* Controls */}
      {isRunning && (
        <Box>
          <LoadingSpinner label="Running..." />
          <Text color={COLORS.muted}>  Press s to stop</Text>
        </Box>
      )}
      {isDone && (
        <Text color={COLORS.muted}>Press Esc to go back.</Text>
      )}
    </Box>
  );
}

function statusColor(status: LoopProgress['status']): string {
  switch (status) {
    case 'running': return COLORS.primary;
    case 'setup': return COLORS.accent;
    case 'quality-gate': return COLORS.accent;
    case 'committing': return COLORS.secondary;
    case 'complete': return COLORS.success;
    case 'error': return COLORS.error;
    case 'stopped': return COLORS.warning;
    default: return COLORS.text;
  }
}

function passLabel(pass: boolean): string {
  return pass ? '\u2713' : '\u2717';
}
