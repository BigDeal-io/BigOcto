import React from 'react';
import { Box, Text, useInput } from 'ink';
import { loadGlobalPatterns, loadRepoKnowledge } from '../../core/knowledge.js';
import { COLORS, PATTERNS_FILE } from '../../constants.js';
import type { GitEnvironment } from '../../types.js';

interface KnowledgeViewProps {
  onBack: () => void;
  env: GitEnvironment;
}

export function KnowledgeView({ onBack, env }: KnowledgeViewProps) {
  useInput((_input, key) => {
    if (key.escape) onBack();
  });

  const patterns = loadGlobalPatterns();
  const repoKnowledge = loadRepoKnowledge(env.repository?.localPath);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Repository Knowledge</Text>

      <Box flexDirection="column">
        <Text bold color={COLORS.primary}>Global Patterns</Text>
        <Text color={COLORS.muted}>{PATTERNS_FILE}</Text>
        {patterns ? (
          <Text color={COLORS.text}>{patterns.slice(0, 500)}{patterns.length > 500 ? '...' : ''}</Text>
        ) : (
          <Text color={COLORS.muted}>No global patterns file found.</Text>
        )}
      </Box>

      <Box flexDirection="column">
        <Text bold color={COLORS.primary}>Repository CLAUDE.md</Text>
        <Text color={COLORS.muted}>.bigocto/CLAUDE.md</Text>
        {repoKnowledge ? (
          <Text color={COLORS.text}>{repoKnowledge.slice(0, 500)}{repoKnowledge.length > 500 ? '...' : ''}</Text>
        ) : (
          <Text color={COLORS.muted}>No repository knowledge file found.</Text>
        )}
      </Box>
    </Box>
  );
}
