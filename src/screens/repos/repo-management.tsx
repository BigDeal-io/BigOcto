import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select, TextInput } from '@inkjs/ui';
import { COLORS } from '../../constants.js';
import type { BigoctoConfig } from '../../core/config.js';

interface RepoManagementProps {
  config: BigoctoConfig;
  onUpdateConfig: (updater: (config: BigoctoConfig) => BigoctoConfig) => void;
  onBack: () => void;
}

type Mode = 'menu' | 'adding' | 'removing' | 'setting-default';

export function RepoManagement({ config, onUpdateConfig, onBack }: RepoManagementProps) {
  const [mode, setMode] = useState<Mode>('menu');
  const [message, setMessage] = useState<string | null>(null);

  useInput((_input, key) => {
    if (key.escape) {
      if (mode !== 'menu') {
        setMode('menu');
        setMessage(null);
      } else {
        onBack();
      }
    }
  });

  if (mode === 'adding') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Add Repository (owner/name)</Text>
        <TextInput
          placeholder="e.g. bigdealio/mzconnect"
          onSubmit={(value) => {
            const repo = value.trim();
            if (!repo || !repo.includes('/')) {
              setMessage('Invalid format. Use owner/name');
              setMode('menu');
              return;
            }
            onUpdateConfig(c => ({
              ...c,
              repositories: {
                ...c.repositories,
                watched: [...new Set([...c.repositories.watched, repo])],
              },
            }));
            setMessage(`Added ${repo}`);
            setMode('menu');
          }}
        />
      </Box>
    );
  }

  if (mode === 'removing' && config.repositories.watched.length > 0) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Remove Repository</Text>
        <Select
          options={config.repositories.watched.map(r => ({ label: r, value: r }))}
          onChange={(value) => {
            onUpdateConfig(c => ({
              ...c,
              repositories: {
                ...c.repositories,
                watched: c.repositories.watched.filter(r => r !== value),
              },
            }));
            setMessage(`Removed ${value}`);
            setMode('menu');
          }}
        />
      </Box>
    );
  }

  if (mode === 'setting-default' && config.repositories.watched.length > 0) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Set Default Repository</Text>
        <Select
          options={config.repositories.watched.map(r => ({ label: r, value: r }))}
          onChange={(value) => {
            onUpdateConfig(c => ({
              ...c,
              general: { ...c.general, default_repo: value },
            }));
            setMessage(`Default set to ${value}`);
            setMode('menu');
          }}
        />
      </Box>
    );
  }

  const menuItems = [
    { label: 'Add Repository', value: 'add' },
    { label: 'Remove Repository', value: 'remove' },
    { label: 'Set Default Repository', value: 'set-default' },
  ];

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Repository Management</Text>
      {config.repositories.watched.length > 0 ? (
        <Box flexDirection="column">
          <Text color={COLORS.muted}>Watched repositories:</Text>
          {config.repositories.watched.map(r => (
            <Text key={r} color={COLORS.text}>
              {r === config.general.default_repo ? '\u2713 ' : '  '}{r}
              {r === config.general.default_repo ? <Text color={COLORS.primary}> (default)</Text> : ''}
            </Text>
          ))}
        </Box>
      ) : (
        <Text color={COLORS.muted}>No repositories configured.</Text>
      )}
      {message && <Text color={COLORS.success}>{message}</Text>}
      <Select
        options={menuItems.map(i => ({ label: i.label, value: i.value }))}
        onChange={(value) => {
          setMessage(null);
          if (value === 'add') setMode('adding');
          else if (value === 'remove') setMode('removing');
          else if (value === 'set-default') setMode('setting-default');
        }}
      />
    </Box>
  );
}
