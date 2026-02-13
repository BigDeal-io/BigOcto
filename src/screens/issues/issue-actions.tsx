import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select, TextInput } from '@inkjs/ui';
import { useIssueDetail } from '../../hooks/use-issues.js';
import { executeGhCommand } from '../../core/executor.js';
import { buildCloseIssue, buildReopenIssue, buildAddComment, buildOpenInBrowser } from '../../core/github.js';
import { addHistoryEntry } from '../../core/history.js';
import { LoadingSpinner } from '../../components/loading-spinner.js';
import { ErrorDisplay } from '../../components/error-display.js';
import { ConfirmDialog } from '../../components/confirm-dialog.js';
import { COLORS } from '../../constants.js';
import type { Screen, GitEnvironment } from '../../types.js';

interface IssueActionsProps {
  issueNumber: number;
  onSelect: (screen: Screen) => void;
  onBack: () => void;
  env: GitEnvironment;
}

type ActionState =
  | { mode: 'menu' }
  | { mode: 'commenting' }
  | { mode: 'confirming-close' }
  | { mode: 'confirming-reopen' }
  | { mode: 'executing'; label: string }
  | { mode: 'result'; message: string; success: boolean };

export function IssueActions({ issueNumber, onSelect, onBack, env }: IssueActionsProps) {
  const repo = env.repository?.fullName;
  const { issue, loading, error } = useIssueDetail(repo, issueNumber);
  const [state, setState] = useState<ActionState>({ mode: 'menu' });

  useInput((_input, key) => {
    if (key.escape) {
      if (state.mode !== 'menu') {
        setState({ mode: 'menu' });
      } else {
        onBack();
      }
    }
  });

  if (loading) return <LoadingSpinner label={`Loading issue #${issueNumber}...`} />;
  if (error) return <ErrorDisplay error={error} />;
  if (!issue || !repo) return <ErrorDisplay error="Issue not found" />;

  const stateColor = issue.state === 'OPEN' ? COLORS.issueOpen : COLORS.issueClosed;

  async function executeAction(action: () => Promise<void>, label: string) {
    setState({ mode: 'executing', label });
    try {
      await action();
      setState({ mode: 'result', message: `${label} successful`, success: true });
    } catch (err) {
      setState({ mode: 'result', message: `Failed: ${err instanceof Error ? err.message : String(err)}`, success: false });
    }
  }

  function handleSelect(value: string) {
    switch (value) {
      case 'view-detail':
        onSelect({ type: 'issue-detail', issueNumber });
        break;
      case 'send-claude':
        onSelect({ type: 'claude-agent-launch', issueNumber });
        break;
      case 'start-loop':
        onSelect({ type: 'loop-config' });
        break;
      case 'add-comment':
        setState({ mode: 'commenting' });
        break;
      case 'close':
        setState({ mode: 'confirming-close' });
        break;
      case 'reopen':
        setState({ mode: 'confirming-reopen' });
        break;
      case 'open-browser':
        executeGhCommand(buildOpenInBrowser(repo!, issueNumber));
        addHistoryEntry({ action: 'Open in browser', detail: `#${issueNumber}`, success: true, repository: repo });
        break;
    }
  }

  if (state.mode === 'commenting') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Add comment to #{issueNumber}</Text>
        <TextInput
          placeholder="Type your comment..."
          onSubmit={async (value) => {
            if (!value.trim()) {
              setState({ mode: 'menu' });
              return;
            }
            await executeAction(async () => {
              const result = await executeGhCommand(buildAddComment(repo!, issueNumber, value));
              if (result.exitCode !== 0) throw new Error(result.stderr);
              addHistoryEntry({ action: 'Add comment', detail: `#${issueNumber}`, success: true, repository: repo });
            }, 'Add comment');
          }}
        />
      </Box>
    );
  }

  if (state.mode === 'confirming-close') {
    return (
      <ConfirmDialog
        message={`Close issue #${issueNumber}: ${issue.title}?`}
        onConfirm={() => executeAction(async () => {
          const result = await executeGhCommand(buildCloseIssue(repo!, issueNumber));
          if (result.exitCode !== 0) throw new Error(result.stderr);
          addHistoryEntry({ action: 'Close issue', detail: `#${issueNumber}`, success: true, repository: repo });
        }, 'Close issue')}
        onCancel={() => setState({ mode: 'menu' })}
      />
    );
  }

  if (state.mode === 'confirming-reopen') {
    return (
      <ConfirmDialog
        message={`Reopen issue #${issueNumber}: ${issue.title}?`}
        onConfirm={() => executeAction(async () => {
          const result = await executeGhCommand(buildReopenIssue(repo!, issueNumber));
          if (result.exitCode !== 0) throw new Error(result.stderr);
          addHistoryEntry({ action: 'Reopen issue', detail: `#${issueNumber}`, success: true, repository: repo });
        }, 'Reopen issue')}
        onCancel={() => setState({ mode: 'menu' })}
      />
    );
  }

  if (state.mode === 'executing') {
    return <LoadingSpinner label={state.label} />;
  }

  if (state.mode === 'result') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color={state.success ? COLORS.success : COLORS.error}>{state.message}</Text>
        <Text color={COLORS.muted}>Press Esc to go back</Text>
      </Box>
    );
  }

  const actions = [
    { label: 'View Full Details', value: 'view-detail' },
    { label: 'Send to Claude Agent', value: 'send-claude' },
    { label: 'Start Loop on This Issue', value: 'start-loop' },
    { label: 'Add Comment', value: 'add-comment' },
    ...(issue.state === 'OPEN'
      ? [{ label: 'Close Issue', value: 'close' }]
      : [{ label: 'Reopen Issue', value: 'reopen' }]),
    { label: 'Open in Browser', value: 'open-browser' },
  ];

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={1}>
        <Text bold color={stateColor}>#{issue.number}</Text>
        <Text bold color={COLORS.text}>{issue.title}</Text>
      </Box>
      <Box gap={1}>
        {issue.labels.map(label => (
          <Text key={label.name} color={`#${label.color}`}>[{label.name}]</Text>
        ))}
        {issue.assignees.length > 0 && (
          <Text color={COLORS.muted}>@{issue.assignees.map(a => a.login).join(', ')}</Text>
        )}
      </Box>
      <Select
        options={actions.map(a => ({ label: a.label, value: a.value }))}
        onChange={handleSelect}
      />
    </Box>
  );
}
