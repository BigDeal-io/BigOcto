import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '../constants.js';

interface ErrorDisplayProps {
  error: string;
  title?: string;
}

export function ErrorDisplay({ error, title }: ErrorDisplayProps) {
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.error}>{title ?? 'Error'}</Text>
      <Text color={COLORS.error}>{error}</Text>
    </Box>
  );
}
