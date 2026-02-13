import React from 'react';
import { Box, Text } from 'ink';
import { APP_AUTHOR, APP_AUTHOR_URL, COLORS, KEY_LABELS } from '../constants.js';
import type { Screen } from '../types.js';

interface FooterProps {
  screen: Screen;
}

export function Footer({ screen }: FooterProps) {
  const hints = getHints(screen);

  return (
    <Box width="100%" paddingX={1} flexDirection="column">
      <Box width="100%">
        <Text color={COLORS.border}>{'\u2500'.repeat(60)}</Text>
      </Box>
      <Box justifyContent="space-between" width="100%">
        <Box gap={2}>
          {hints.map((hint, i) => (
            <Text key={i} color={COLORS.muted}>{hint}</Text>
          ))}
        </Box>
        <Text color={COLORS.border}>{APP_AUTHOR} {'\u2502'} {APP_AUTHOR_URL}</Text>
      </Box>
    </Box>
  );
}

function getHints(screen: Screen): string[] {
  switch (screen.type) {
    case 'main-menu':
      return [KEY_LABELS.navigate, KEY_LABELS.select, KEY_LABELS.help, KEY_LABELS.quit];
    case 'help':
      return [KEY_LABELS.navigate, KEY_LABELS.back];
    case 'action-history':
      return [KEY_LABELS.navigate, KEY_LABELS.refresh, KEY_LABELS.back];
    case 'issue-browser':
      return [KEY_LABELS.navigate, KEY_LABELS.select, KEY_LABELS.refresh, KEY_LABELS.search, KEY_LABELS.back];
    case 'issue-detail':
      return [KEY_LABELS.navigate, KEY_LABELS.openBrowser, KEY_LABELS.refresh, KEY_LABELS.back];
    case 'issue-actions':
      return [KEY_LABELS.navigate, KEY_LABELS.select, KEY_LABELS.back];
    case 'issue-create':
      return [KEY_LABELS.confirm, KEY_LABELS.cancel];
    case 'loop-running':
      return [KEY_LABELS.back];
    default:
      return [KEY_LABELS.navigate, KEY_LABELS.select, KEY_LABELS.back, KEY_LABELS.help];
  }
}
