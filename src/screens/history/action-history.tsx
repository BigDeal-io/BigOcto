import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { loadHistory } from '../../core/history.js';
import { COLORS } from '../../constants.js';
import type { HistoryEntry } from '../../types.js';

interface ActionHistoryProps {
  onBack: () => void;
}

export function ActionHistory({ onBack }: ActionHistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useInput((input, key) => {
    if (key.escape) onBack();
    if (input === 'r') setEntries(loadHistory().reverse());
  });

  useEffect(() => {
    setEntries(loadHistory().reverse());
  }, []);

  if (entries.length === 0) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Action History</Text>
        <Text color={COLORS.muted}>No actions recorded yet.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Action History</Text>
      <Box flexDirection="column">
        {entries.slice(0, 20).map((entry, i) => (
          <Box key={i} gap={1}>
            <Text color={entry.success ? COLORS.success : COLORS.error}>
              {entry.success ? '\u2713' : '\u2717'}
            </Text>
            <Text color={COLORS.muted}>{formatTime(entry.timestamp)}</Text>
            <Text color={COLORS.text}>{entry.action}</Text>
            <Text color={COLORS.muted}>{entry.detail}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
