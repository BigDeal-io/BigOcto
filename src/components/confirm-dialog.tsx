import React from 'react';
import { Box, Text, useInput } from 'ink';
import { COLORS } from '../constants.js';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  useInput((input, key) => {
    if (input === 'y' || input === 'Y') {
      onConfirm();
    } else if (input === 'n' || input === 'N' || key.escape) {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text color={COLORS.accent}>{message}</Text>
      <Text color={COLORS.muted}>Press <Text bold color={COLORS.secondary}>y</Text> to confirm, <Text bold color={COLORS.error}>n</Text> to cancel</Text>
    </Box>
  );
}
