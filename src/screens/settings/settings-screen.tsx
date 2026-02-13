import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Select } from '@inkjs/ui';
import { COLORS, CONFIG_FILE } from '../../constants.js';
import type { BigoctoConfig } from '../../core/config.js';

interface SettingsScreenProps {
  config: BigoctoConfig;
  onUpdateConfig: (updater: (config: BigoctoConfig) => BigoctoConfig) => void;
  onBack: () => void;
}

export function SettingsScreen({ config, onUpdateConfig, onBack }: SettingsScreenProps) {
  useInput((_input, key) => {
    if (key.escape) onBack();
  });

  const items = [
    {
      label: `Claude Model: ${config.claude_agent.model}`,
      value: 'model',
    },
    {
      label: `Max Agent Turns: ${config.claude_agent.max_turns}`,
      value: 'max-turns',
    },
    {
      label: `Loop Max Iterations: ${config.loop.max_iterations_default}`,
      value: 'loop-iterations',
    },
    {
      label: `Use Worktree: ${config.loop.use_worktree ? 'Yes' : 'No'}`,
      value: 'worktree',
    },
    {
      label: `Worktree Quality Gate: ${config.loop.worktree_quality_gate}`,
      value: 'worktree-qg',
    },
    {
      label: `Confirm Destructive: ${config.ui.confirm_destructive ? 'Yes' : 'No'}`,
      value: 'confirm-destructive',
    },
  ];

  function handleSelect(value: string) {
    switch (value) {
      case 'model':
        onUpdateConfig(c => ({
          ...c,
          claude_agent: {
            ...c.claude_agent,
            model: c.claude_agent.model === 'claude-sonnet-4-5-20250929'
              ? 'claude-opus-4-6'
              : 'claude-sonnet-4-5-20250929',
          },
        }));
        break;
      case 'max-turns':
        onUpdateConfig(c => ({
          ...c,
          claude_agent: {
            ...c.claude_agent,
            max_turns: c.claude_agent.max_turns === 50 ? 100 : c.claude_agent.max_turns === 100 ? 25 : 50,
          },
        }));
        break;
      case 'loop-iterations':
        onUpdateConfig(c => ({
          ...c,
          loop: {
            ...c.loop,
            max_iterations_default: c.loop.max_iterations_default === 20 ? 50 : c.loop.max_iterations_default === 50 ? 100 : 20,
          },
        }));
        break;
      case 'worktree':
        onUpdateConfig(c => ({
          ...c,
          loop: { ...c.loop, use_worktree: !c.loop.use_worktree },
        }));
        break;
      case 'worktree-qg':
        onUpdateConfig(c => ({
          ...c,
          loop: {
            ...c.loop,
            worktree_quality_gate: c.loop.worktree_quality_gate === 'code-only' ? 'full' : c.loop.worktree_quality_gate === 'full' ? 'off' : 'code-only',
          },
        }));
        break;
      case 'confirm-destructive':
        onUpdateConfig(c => ({
          ...c,
          ui: { ...c.ui, confirm_destructive: !c.ui.confirm_destructive },
        }));
        break;
    }
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Settings</Text>
      <Text color={COLORS.muted}>Config: {CONFIG_FILE}</Text>
      <Text color={COLORS.muted}>Select to toggle/cycle values:</Text>
      <Select
        options={items.map(i => ({ label: i.label, value: i.value }))}
        onChange={handleSelect}
      />
    </Box>
  );
}
