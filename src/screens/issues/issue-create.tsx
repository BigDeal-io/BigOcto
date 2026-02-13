import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextInput } from '@inkjs/ui';
import { executeGhCommand } from '../../core/executor.js';
import { buildCreateIssue } from '../../core/github.js';
import { addHistoryEntry } from '../../core/history.js';
import { LoadingSpinner } from '../../components/loading-spinner.js';
import { ConfirmDialog } from '../../components/confirm-dialog.js';
import { ErrorDisplay } from '../../components/error-display.js';
import { COLORS } from '../../constants.js';
import type { GitEnvironment } from '../../types.js';

interface IssueCreateProps {
  onBack: () => void;
  env: GitEnvironment;
}

type Step = 'title' | 'body' | 'labels' | 'confirm' | 'submitting' | 'done';

export function IssueCreate({ onBack, env }: IssueCreateProps) {
  const repo = env.repository?.fullName;
  const [step, setStep] = useState<Step>('title');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [labels, setLabels] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useInput((_input, key) => {
    if (key.escape) {
      if (step === 'done') {
        onBack();
      } else if (step === 'body') {
        setStep('title');
      } else if (step === 'labels') {
        setStep('body');
      } else if (step === 'confirm') {
        setStep('labels');
      } else {
        onBack();
      }
    }
  });

  if (!repo) {
    return <ErrorDisplay error="No repository detected." />;
  }

  async function submitIssue() {
    setStep('submitting');
    try {
      const labelList = labels.split(',').map(l => l.trim()).filter(Boolean);
      const args = buildCreateIssue(repo!, { title, body: body || undefined, labels: labelList.length ? labelList : undefined });
      const res = await executeGhCommand(args);
      if (res.exitCode === 0) {
        addHistoryEntry({ action: 'Create issue', detail: title, success: true, repository: repo });
        setResult({ success: true, message: `Issue created: ${res.stdout.trim()}` });
      } else {
        setResult({ success: false, message: res.stderr || 'Failed to create issue' });
      }
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : String(err) });
    }
    setStep('done');
  }

  if (step === 'submitting') {
    return <LoadingSpinner label="Creating issue..." />;
  }

  if (step === 'done' && result) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color={result.success ? COLORS.success : COLORS.error}>{result.message}</Text>
        <Text color={COLORS.muted}>Press Esc to go back</Text>
      </Box>
    );
  }

  if (step === 'confirm') {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color={COLORS.accent}>Create Issue - Confirm</Text>
        <Box flexDirection="column">
          <Text color={COLORS.text}>Title: <Text bold>{title}</Text></Text>
          <Text color={COLORS.text}>Body: <Text>{body || '(none)'}</Text></Text>
          <Text color={COLORS.text}>Labels: <Text>{labels || '(none)'}</Text></Text>
          <Text color={COLORS.text}>Repository: <Text>{repo}</Text></Text>
        </Box>
        <ConfirmDialog
          message="Create this issue?"
          onConfirm={submitIssue}
          onCancel={() => setStep('labels')}
        />
      </Box>
    );
  }

  const prompts: Record<string, { label: string; placeholder: string; onSubmit: (v: string) => void }> = {
    title: {
      label: 'Issue Title',
      placeholder: 'Enter issue title...',
      onSubmit: (v) => { setTitle(v); setStep('body'); },
    },
    body: {
      label: 'Issue Body (optional)',
      placeholder: 'Enter description...',
      onSubmit: (v) => { setBody(v); setStep('labels'); },
    },
    labels: {
      label: 'Labels (comma-separated, optional)',
      placeholder: 'bug, enhancement...',
      onSubmit: (v) => { setLabels(v); setStep('confirm'); },
    },
  };

  const current = prompts[step]!;

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color={COLORS.accent}>Create Issue - {current.label}</Text>
      {title && <Text color={COLORS.muted}>Title: {title}</Text>}
      {body && step !== 'body' && <Text color={COLORS.muted}>Body: {body.slice(0, 50)}...</Text>}
      <TextInput
        placeholder={current.placeholder}
        onSubmit={current.onSubmit}
      />
    </Box>
  );
}
