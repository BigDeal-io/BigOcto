import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select, TextInput } from '@inkjs/ui';
import { COLORS } from '../../constants.js';
import type { BigoctoConfig } from '../../core/config.js';
import type { QualityGateMode } from '../../core/quality-gate.js';
import type { GitEnvironment, Screen } from '../../types.js';

export interface LoopLaunchConfig {
  issueNumber: number;
  maxIterations: number;
  model: string;
  useWorktree: boolean;
  qualityGateMode: QualityGateMode;
  sleepBetweenIterations: number;
}

interface LoopConfigProps {
  onBack: () => void;
  onLaunch: (config: LoopLaunchConfig) => void;
  env: GitEnvironment;
  config: BigoctoConfig;
}

type Step = 'issue' | 'workspace' | 'settings' | 'confirm';

const MODELS = ['claude-sonnet-4-5-20250929', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'];
const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-5-20250929': 'Sonnet 4.5',
  'claude-opus-4-6': 'Opus 4.6',
  'claude-haiku-4-5-20251001': 'Haiku 4.5',
};

export function LoopConfig({ onBack, onLaunch, env, config }: LoopConfigProps) {
  const [step, setStep] = useState<Step>('issue');
  const [issueInput, setIssueInput] = useState('');
  const [issueNumber, setIssueNumber] = useState<number>(0);
  const [useWorktree, setUseWorktree] = useState(config.loop.use_worktree);
  const [qualityGateMode, setQualityGateMode] = useState<QualityGateMode>(
    config.loop.use_worktree
      ? (config.loop.worktree_quality_gate as QualityGateMode)
      : (config.loop.current_folder_quality_gate as QualityGateMode),
  );
  const [maxIterations, setMaxIterations] = useState(config.loop.max_iterations_default);
  const [model, setModel] = useState(config.claude_agent.model);

  useInput((_input, key) => {
    if (key.escape) {
      if (step === 'issue') onBack();
      else if (step === 'workspace') setStep('issue');
      else if (step === 'settings') setStep('workspace');
      else if (step === 'confirm') setStep('settings');
    }
  });

  if (!env.repository) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color={COLORS.error}>No repository detected. Loop mode requires a Git repository.</Text>
        <Text color={COLORS.muted}>Press Esc to go back.</Text>
      </Box>
    );
  }

  if (step === 'issue') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Loop Mode - Select Issue</Text>
        <Text color={COLORS.text}>Repository: <Text bold>{env.repository.fullName}</Text></Text>
        <Box>
          <Text color={COLORS.text}>Issue number: </Text>
          <TextInput
            placeholder="e.g. 42"
            onSubmit={(value) => {
              const num = parseInt(value, 10);
              if (num > 0) {
                setIssueNumber(num);
                setStep('workspace');
              }
            }}
          />
        </Box>
        <Text color={COLORS.muted}>Enter a GitHub issue number, then press Enter.</Text>
      </Box>
    );
  }

  if (step === 'workspace') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Loop Mode - Workspace Strategy</Text>
        <Text color={COLORS.text}>Issue: <Text bold>#{issueNumber}</Text></Text>
        <Select
          options={[
            { label: 'Worktree + Code Only (Recommended)', value: 'worktree-code-only' },
            { label: 'Worktree + Full Quality Gates', value: 'worktree-full' },
            { label: 'Current Folder + Full Quality Gates', value: 'current-full' },
            { label: 'Current Folder + No Quality Gates', value: 'current-off' },
          ]}
          onChange={(value) => {
            if (value === 'worktree-code-only') {
              setUseWorktree(true);
              setQualityGateMode('code-only');
            } else if (value === 'worktree-full') {
              setUseWorktree(true);
              setQualityGateMode('full');
            } else if (value === 'current-full') {
              setUseWorktree(false);
              setQualityGateMode('full');
            } else if (value === 'current-off') {
              setUseWorktree(false);
              setQualityGateMode('off');
            }
            setStep('settings');
          }}
        />
      </Box>
    );
  }

  if (step === 'settings') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Loop Mode - Settings</Text>
        <Box flexDirection="column">
          <Text color={COLORS.text}>Issue: <Text bold>#{issueNumber}</Text></Text>
          <Text color={COLORS.text}>Worktree: <Text bold>{useWorktree ? 'Yes' : 'No'}</Text></Text>
          <Text color={COLORS.text}>Quality Gate: <Text bold>{qualityGateMode}</Text></Text>
        </Box>
        <Select
          options={[
            { label: 'Continue with these settings', value: 'confirm' },
            { label: `Model: ${MODEL_LABELS[model] ?? model}`, value: 'toggle-model' },
            { label: `Max Iterations: ${maxIterations}`, value: 'toggle-iterations' },
          ]}
          onChange={(value) => {
            if (value === 'confirm') {
              setStep('confirm');
            } else if (value === 'toggle-model') {
              const idx = MODELS.indexOf(model);
              setModel(MODELS[(idx + 1) % MODELS.length]!);
            } else if (value === 'toggle-iterations') {
              setMaxIterations(n => {
                if (n === 5) return 10;
                if (n === 10) return 20;
                if (n === 20) return 50;
                return 5;
              });
            }
          }}
        />
      </Box>
    );
  }

  // Confirm step
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Loop Mode - Confirm Launch</Text>
      <Box flexDirection="column">
        <Text color={COLORS.text}>Repository: <Text bold>{env.repository.fullName}</Text></Text>
        <Text color={COLORS.text}>Issue: <Text bold>#{issueNumber}</Text></Text>
        <Text color={COLORS.text}>Model: <Text bold>{MODEL_LABELS[model] ?? model}</Text></Text>
        <Text color={COLORS.text}>Max Iterations: <Text bold>{maxIterations}</Text></Text>
        <Text color={COLORS.text}>Worktree: <Text bold>{useWorktree ? 'Yes' : 'No'}</Text></Text>
        <Text color={COLORS.text}>Quality Gate: <Text bold>{qualityGateMode}</Text></Text>
      </Box>
      <Select
        options={[
          { label: 'Launch Loop', value: 'launch' },
          { label: 'Go Back', value: 'back' },
        ]}
        onChange={(value) => {
          if (value === 'launch') {
            onLaunch({
              issueNumber,
              maxIterations,
              model,
              useWorktree,
              qualityGateMode,
              sleepBetweenIterations: config.loop.sleep_between_iterations,
            });
          } else {
            setStep('settings');
          }
        }}
      />
    </Box>
  );
}
