import { describe, it, expect } from 'vitest';
import {
  buildListIssues,
  buildViewIssue,
  buildCreateIssue,
  buildCloseIssue,
  buildReopenIssue,
  buildAddComment,
  buildEditIssue,
  buildListLabels,
  parseIssueList,
  parseIssueDetail,
  parseLabelList,
} from '../../src/core/github.js';

describe('GitHub command builders', () => {
  const repo = 'bigdealio/mzconnect';

  it('buildListIssues returns correct args with defaults', () => {
    const args = buildListIssues(repo);
    expect(args).toContain('issue');
    expect(args).toContain('list');
    expect(args).toContain('-R');
    expect(args).toContain(repo);
    expect(args).toContain('--json');
    expect(args).toContain('--limit');
    expect(args).toContain('50');
  });

  it('buildListIssues includes filter options', () => {
    const args = buildListIssues(repo, {
      state: 'closed',
      assignee: 'jeffwray',
      labels: ['bug', 'priority'],
      limit: 100,
    });
    expect(args).toContain('--state');
    expect(args).toContain('closed');
    expect(args).toContain('--assignee');
    expect(args).toContain('jeffwray');
    expect(args).toContain('--label');
    expect(args).toContain('bug,priority');
    expect(args).toContain('100');
  });

  it('buildViewIssue returns correct args', () => {
    const args = buildViewIssue(repo, 123);
    expect(args).toContain('issue');
    expect(args).toContain('view');
    expect(args).toContain('123');
    expect(args).toContain('-R');
    expect(args).toContain(repo);
    expect(args).toContain('--json');
  });

  it('buildCreateIssue returns correct args', () => {
    const args = buildCreateIssue(repo, {
      title: 'Test issue',
      body: 'Test body',
      labels: ['bug'],
      assignees: ['jeffwray'],
    });
    expect(args).toContain('issue');
    expect(args).toContain('create');
    expect(args).toContain('--title');
    expect(args).toContain('Test issue');
    expect(args).toContain('--body');
    expect(args).toContain('Test body');
    expect(args).toContain('--label');
    expect(args).toContain('bug');
    expect(args).toContain('--assignee');
    expect(args).toContain('jeffwray');
  });

  it('buildCloseIssue returns correct args', () => {
    const args = buildCloseIssue(repo, 42);
    expect(args).toEqual(['issue', 'close', '42', '-R', repo]);
  });

  it('buildReopenIssue returns correct args', () => {
    const args = buildReopenIssue(repo, 42);
    expect(args).toEqual(['issue', 'reopen', '42', '-R', repo]);
  });

  it('buildAddComment returns correct args', () => {
    const args = buildAddComment(repo, 42, 'Hello world');
    expect(args).toContain('comment');
    expect(args).toContain('42');
    expect(args).toContain('--body');
    expect(args).toContain('Hello world');
  });

  it('buildEditIssue includes add/remove labels', () => {
    const args = buildEditIssue(repo, 42, {
      addLabels: ['bug'],
      removeLabels: ['wontfix'],
    });
    expect(args).toContain('--add-label');
    expect(args).toContain('bug');
    expect(args).toContain('--remove-label');
    expect(args).toContain('wontfix');
  });

  it('buildListLabels returns correct args', () => {
    const args = buildListLabels(repo);
    expect(args).toContain('label');
    expect(args).toContain('list');
    expect(args).toContain('-R');
    expect(args).toContain(repo);
  });
});

describe('GitHub parsers', () => {
  it('parseIssueList parses valid JSON', () => {
    const json = JSON.stringify([
      {
        number: 1,
        title: 'Test issue',
        body: 'Body text',
        state: 'OPEN',
        labels: [{ name: 'bug', color: 'ff0000' }],
        assignees: [{ login: 'jeff' }],
        milestone: null,
        comments: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        url: 'https://github.com/org/repo/issues/1',
        author: { login: 'jeff' },
      },
    ]);
    const issues = parseIssueList(json);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.number).toBe(1);
    expect(issues[0]!.title).toBe('Test issue');
    expect(issues[0]!.state).toBe('OPEN');
    expect(issues[0]!.labels[0]!.name).toBe('bug');
  });

  it('parseIssueList returns empty array for invalid JSON', () => {
    expect(parseIssueList('not json')).toEqual([]);
  });

  it('parseIssueDetail parses valid JSON', () => {
    const json = JSON.stringify({
      number: 42,
      title: 'Detail test',
      body: 'Detailed body',
      state: 'CLOSED',
      labels: [],
      assignees: [],
      milestone: { title: 'v1.0', number: 1, state: 'open' },
      comments: [
        { id: 1, body: 'A comment', author: { login: 'user' }, createdAt: '2026-01-01T00:00:00Z' },
      ],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      url: 'https://github.com/org/repo/issues/42',
      author: { login: 'user' },
    });
    const issue = parseIssueDetail(json);
    expect(issue).not.toBeNull();
    expect(issue!.number).toBe(42);
    expect(issue!.state).toBe('CLOSED');
    expect(issue!.milestone?.title).toBe('v1.0');
    expect(issue!.comments).toHaveLength(1);
  });

  it('parseIssueDetail returns null for invalid JSON', () => {
    expect(parseIssueDetail('bad')).toBeNull();
  });

  it('parseLabelList parses valid JSON', () => {
    const json = JSON.stringify([
      { name: 'bug', color: 'ff0000', description: 'Something broken' },
      { name: 'feature', color: '00ff00' },
    ]);
    const labels = parseLabelList(json);
    expect(labels).toHaveLength(2);
    expect(labels[0]!.name).toBe('bug');
  });

  it('parseLabelList returns empty array for invalid JSON', () => {
    expect(parseLabelList('bad')).toEqual([]);
  });
});
