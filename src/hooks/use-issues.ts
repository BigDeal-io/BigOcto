import { useState, useEffect, useCallback } from 'react';
import { executeGhCommand } from '../core/executor.js';
import { buildListIssues, buildViewIssue, parseIssueList, parseIssueDetail } from '../core/github.js';
import type { Issue } from '../types.js';

interface UseIssuesResult {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useIssues(repo: string | undefined, options?: {
  state?: 'open' | 'closed' | 'all';
  assignee?: string;
  labels?: string[];
  milestone?: string;
  limit?: number;
}): UseIssuesResult {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!repo) {
      setError('No repository selected');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const args = buildListIssues(repo, options);
      const result = await executeGhCommand(args);
      if (result.exitCode === 0) {
        setIssues(parseIssueList(result.stdout));
      } else {
        setError(result.stderr || 'Failed to fetch issues');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [repo, options?.state, options?.assignee, options?.labels?.join(','), options?.milestone, options?.limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { issues, loading, error, refresh };
}

interface UseIssueDetailResult {
  issue: Issue | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useIssueDetail(repo: string | undefined, issueNumber: number): UseIssueDetailResult {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!repo) {
      setError('No repository selected');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const args = buildViewIssue(repo, issueNumber);
      const result = await executeGhCommand(args);
      if (result.exitCode === 0) {
        setIssue(parseIssueDetail(result.stdout));
      } else {
        setError(result.stderr || 'Failed to fetch issue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [repo, issueNumber]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { issue, loading, error, refresh };
}
