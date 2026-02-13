import React from 'react';
import { Box, Text } from 'ink';
import { Spinner } from '@inkjs/ui';
import { COLORS } from '../constants.js';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <Box gap={1}>
      <Spinner />
      <Text color={COLORS.muted}>{label ?? 'Loading...'}</Text>
    </Box>
  );
}
