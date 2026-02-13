import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useIssueDetail } from '../../hooks/use-issues.js';
import { executeGhCommand } from '../../core/executor.js';
import { buildOpenInBrowser } from '../../core/github.js';
import { LoadingSpinner } from '../../components/loading-spinner.js';
import { ErrorDisplay } from '../../components/error-display.js';
import { COLORS } from '../../constants.js';
import type { GitEnvironment } from '../../types.js';

interface IssueDetailProps {
  issueNumber: number;
  onBack: () => void;
  env: GitEnvironment;
}

export function IssueDetail({ issueNumber, onBack, env }: IssueDetailProps) {
  const repo = env.repository?.fullName;
  const { issue, loading, error, refresh } = useIssueDetail(repo, issueNumber);

  useInput((input, key) => {
    if (key.escape) onBack();
    if (input === 'r') refresh();
    if (input === 'o' && repo) {
      executeGhCommand(buildOpenInBrowser(repo, issueNumber));
    }
  });

  if (loading) return <LoadingSpinner label={`Loading issue #${issueNumber}...`} />;
  if (error) return <ErrorDisplay error={error} />;
  if (!issue) return <ErrorDisplay error="Issue not found" />;

  const stateColor = issue.state === 'OPEN' ? COLORS.issueOpen : COLORS.issueClosed;

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={1}>
        <Text bold color={stateColor}>#{issue.number}</Text>
        <Text bold color={COLORS.text}>{issue.title}</Text>
      </Box>

      <Box gap={2}>
        <Text color={stateColor}>{issue.state}</Text>
        <Text color={COLORS.muted}>by {issue.author.login}</Text>
        <Text color={COLORS.muted}>{formatDate(issue.createdAt)}</Text>
      </Box>

      {issue.labels.length > 0 && (
        <Box gap={1}>
          {issue.labels.map(label => (
            <Text key={label.name} color={`#${label.color}`}>[{label.name}]</Text>
          ))}
        </Box>
      )}

      {issue.assignees.length > 0 && (
        <Text color={COLORS.muted}>Assigned to: {issue.assignees.map(a => a.login).join(', ')}</Text>
      )}

      {issue.milestone && (
        <Text color={COLORS.muted}>Milestone: {issue.milestone.title}</Text>
      )}

      <Box width="100%">
        <Text color={COLORS.border}>{'\u2500'.repeat(50)}</Text>
      </Box>

      <Box flexDirection="column">
        <Text color={COLORS.text}>{renderBody(issue.body)}</Text>
      </Box>

      {issue.comments.length > 0 && (
        <Box flexDirection="column" gap={1}>
          <Box width="100%">
            <Text color={COLORS.border}>{'\u2500'.repeat(50)}</Text>
          </Box>
          <Text bold color={COLORS.accent}>Comments ({issue.comments.length})</Text>
          {issue.comments.map(comment => (
            <Box key={comment.id} flexDirection="column">
              <Box gap={1}>
                <Text bold color={COLORS.primary}>{comment.author.login}</Text>
                <Text color={COLORS.muted}>{formatDate(comment.createdAt)}</Text>
              </Box>
              <Text color={COLORS.text}>{renderBody(comment.body)}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function renderBody(body: string): string {
  if (!body) return '(no description)';
  return body
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```(\w*)\n?/, '\u2500 code \u2500\n').replace(/```$/, '\u2500\u2500\u2500\u2500\u2500'))
    .replace(/^### (.+)$/gm, '\u2501 $1')
    .replace(/^## (.+)$/gm, '\u2501\u2501 $1')
    .replace(/^# (.+)$/gm, '\u2501\u2501\u2501 $1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1');
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
