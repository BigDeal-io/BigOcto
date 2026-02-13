import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select } from '@inkjs/ui';
import { useIssueDetail } from '../../hooks/use-issues.js';
import { launchClaudeAgent, type AgentMessage } from '../../core/claude-agent.js';
import { LoadingSpinner } from '../../components/loading-spinner.js';
import { ErrorDisplay } from '../../components/error-display.js';
import { COLORS } from '../../constants.js';
import type { GitEnvironment } from '../../types.js';

interface ClaudeAgentLaunchProps {
  issueNumber: number;
  onBack: () => void;
  env: GitEnvironment;
}

type Phase = 'options' | 'running' | 'done';

export function ClaudeAgentLaunch({ issueNumber, onBack, env }: ClaudeAgentLaunchProps) {
  const repo = env.repository?.fullName;
  const { issue, loading, error } = useIssueDetail(repo, issueNumber);
  const [phase, setPhase] = useState<Phase>('options');
  const [model, setModel] = useState('sonnet');
  const [maxTurns, setMaxTurns] = useState(50);
  const [includeComments, setIncludeComments] = useState(true);
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  useInput((_input, key) => {
    if (key.escape) {
      if (phase === 'done' || phase === 'options') {
        onBack();
      }
    }
  });

  async function startAgent() {
    if (!issue || !repo) return;
    setPhase('running');

    const generator = launchClaudeAgent({
      issue,
      repository: repo,
      repoPath: env.repository?.localPath,
      model,
      maxTurns,
      includeComments,
    });

    for await (const msg of generator) {
      setMessages(prev => [...prev, msg]);
      if (msg.type === 'result' || msg.type === 'error') {
        setPhase('done');
      }
    }
  }

  if (loading) return <LoadingSpinner label={`Loading issue #${issueNumber}...`} />;
  if (error) return <ErrorDisplay error={error} />;
  if (!issue) return <ErrorDisplay error="Issue not found" />;

  if (phase === 'options') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Claude Agent Launch - #{issue.number}: {issue.title}</Text>
        <Box flexDirection="column">
          <Text color={COLORS.text}>Model: <Text bold>{model}</Text></Text>
          <Text color={COLORS.text}>Max turns: <Text bold>{maxTurns}</Text></Text>
          <Text color={COLORS.text}>Include comments: <Text bold>{includeComments ? 'Yes' : 'No'}</Text></Text>
        </Box>
        <Select
          options={[
            { label: 'Launch Agent', value: 'launch' },
            { label: `Toggle Model (${model})`, value: 'toggle-model' },
            { label: `Toggle Max Turns (${maxTurns})`, value: 'toggle-turns' },
            { label: `Toggle Comments (${includeComments ? 'Yes' : 'No'})`, value: 'toggle-comments' },
          ]}
          onChange={(value) => {
            if (value === 'launch') startAgent();
            else if (value === 'toggle-model') setModel(m => m === 'sonnet' ? 'opus' : m === 'opus' ? 'haiku' : 'sonnet');
            else if (value === 'toggle-turns') setMaxTurns(t => t === 50 ? 100 : t === 100 ? 25 : 50);
            else if (value === 'toggle-comments') setIncludeComments(c => !c);
          }}
        />
      </Box>
    );
  }

  // Running or done
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>
        Claude Agent - #{issue.number} {phase === 'running' ? '(Running)' : '(Complete)'}
      </Text>
      <Box flexDirection="column">
        {messages.slice(-15).map((msg, i) => (
          <Text key={i} color={
            msg.type === 'error' ? COLORS.error :
            msg.type === 'result' ? COLORS.success :
            msg.type === 'tool_use' ? COLORS.accent :
            COLORS.text
          }>
            {msg.type === 'tool_use' ? '\u2699 ' : ''}{msg.content.slice(0, 120)}
          </Text>
        ))}
      </Box>
      {phase === 'running' && <LoadingSpinner label="Agent working..." />}
      {phase === 'done' && <Text color={COLORS.muted}>Press Esc to go back</Text>}
    </Box>
  );
}
