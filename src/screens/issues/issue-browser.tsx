import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select, TextInput } from '@inkjs/ui';
import { useIssues } from '../../hooks/use-issues.js';
import { LoadingSpinner } from '../../components/loading-spinner.js';
import { ErrorDisplay } from '../../components/error-display.js';
import { COLORS } from '../../constants.js';
import type { Screen, GitEnvironment } from '../../types.js';

interface IssueBrowserProps {
  onSelect: (screen: Screen) => void;
  onBack: () => void;
  env: GitEnvironment;
}

export function IssueBrowser({ onSelect, onBack, env }: IssueBrowserProps) {
  const repo = env.repository?.fullName;
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { issues, loading, error, refresh } = useIssues(repo);

  useInput((input, key) => {
    if (key.escape) {
      if (searchMode) {
        setSearchMode(false);
        setSearchQuery('');
      } else {
        onBack();
      }
      return;
    }
    if (input === 'r' && !searchMode) {
      refresh();
    }
    if (input === '/' && !searchMode) {
      setSearchMode(true);
    }
  });

  if (!repo) {
    return <ErrorDisplay error="No repository detected. Navigate to a git repo or configure repos in Settings." />;
  }

  if (loading) {
    return <LoadingSpinner label="Fetching issues..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const filtered = searchQuery
    ? issues.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(i.number).includes(searchQuery) ||
        i.labels.some(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : issues;

  if (issues.length === 0) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color={COLORS.muted}>No open issues found in {repo}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Issues in {repo}</Text>
      {searchMode && (
        <Box gap={1}>
          <Text color={COLORS.primary}>/</Text>
          <TextInput
            placeholder="Search issues..."
            onSubmit={(value) => {
              setSearchQuery(value);
              setSearchMode(false);
            }}
          />
        </Box>
      )}
      {searchQuery && !searchMode && (
        <Text color={COLORS.muted}>Filter: "{searchQuery}" ({filtered.length} results)</Text>
      )}
      <Select
        options={filtered.map(issue => ({
          label: `#${issue.number} ${issue.title}${issue.labels.length ? ` [${issue.labels.map(l => l.name).join(', ')}]` : ''}${issue.assignees.length ? ` @${issue.assignees[0]!.login}` : ''}`,
          value: String(issue.number),
        }))}
        onChange={(value) => {
          onSelect({ type: 'issue-actions', issueNumber: parseInt(value, 10) });
        }}
      />
    </Box>
  );
}
