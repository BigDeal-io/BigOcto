import React from 'react';
import { Box, Text, useInput } from 'ink';
import { COLORS } from '../../constants.js';

interface HelpScreenProps {
  onBack: () => void;
}

const keybindings = [
  { key: '\u2191 / \u2193', action: 'Navigate menu items' },
  { key: 'Enter', action: 'Select / confirm' },
  { key: 'Esc', action: 'Go back / cancel' },
  { key: 'q', action: 'Quit (from main menu)' },
  { key: '?', action: 'Show this help screen' },
  { key: 'r', action: 'Refresh current view' },
  { key: 'o', action: 'Open in browser' },
  { key: '/', action: 'Search / filter' },
];

export function HelpScreen({ onBack }: HelpScreenProps) {
  useInput((_input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Keybindings</Text>
      <Box flexDirection="column">
        {keybindings.map(({ key, action }) => (
          <Box key={key} gap={1}>
            <Box width={14}>
              <Text bold color={COLORS.primary}>{key}</Text>
            </Box>
            <Text color={COLORS.text}>{action}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>About BIGOCTO</Text>
        <Text color={COLORS.text}>
          BIGOCTO is a menu-driven terminal UI for GitHub issue management
          with Claude Agent SDK integration. Part of the BIGDEALIO suite.
        </Text>
        <Text color={COLORS.muted}>
          Browse issues, send them to Claude for AI-assisted development,
          or run autonomous loops that work on issues unattended.
        </Text>
      </Box>
    </Box>
  );
}
