export type Screen =
  | { type: 'main-menu' }
  | { type: 'issue-browser' }
  | { type: 'issue-detail'; issueNumber: number }
  | { type: 'issue-actions'; issueNumber: number }
  | { type: 'issue-create' }
  | { type: 'loop-config' }
  | { type: 'loop-running' }
  | { type: 'knowledge-view' }
  | { type: 'action-history' }
  | { type: 'repo-management' }
  | { type: 'settings' }
  | { type: 'help' }
  | { type: 'claude-agent-launch'; issueNumber: number };

export const SCREEN_LABELS: Record<Screen['type'], string> = {
  'main-menu': 'Main Menu',
  'issue-browser': 'Browse Issues',
  'issue-detail': 'Issue Detail',
  'issue-actions': 'Issue Actions',
  'issue-create': 'Create Issue',
  'loop-config': 'Loop Configuration',
  'loop-running': 'Loop Running',
  'knowledge-view': 'Knowledge',
  'action-history': 'Action History',
  'repo-management': 'Repositories',
  'settings': 'Settings',
  'help': 'Help',
  'claude-agent-launch': 'Claude Agent',
};

export interface Issue {
  number: number;
  title: string;
  body: string;
  state: 'OPEN' | 'CLOSED';
  labels: Label[];
  assignees: User[];
  milestone?: Milestone;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  url: string;
  author: User;
}

export interface Label {
  name: string;
  color: string;
  description?: string;
}

export interface User {
  login: string;
  name?: string;
}

export interface Milestone {
  title: string;
  number: number;
  state: string;
  dueOn?: string;
}

export interface Comment {
  id: number;
  body: string;
  author: User;
  createdAt: string;
}

export interface Repository {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch?: string;
  localPath?: string;
}

export interface GitEnvironment {
  isGitRepo: boolean;
  repository?: Repository;
  ghAuthenticated: boolean;
  currentBranch?: string;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface HistoryEntry {
  action: string;
  detail: string;
  timestamp: number;
  success: boolean;
  repository?: string;
}

export interface IterationResult {
  iteration: number;
  success: boolean;
  testsPass: boolean;
  lintPass: boolean;
  typecheckPass: boolean;
  commitHash?: string;
  learnings: string[];
  complete: boolean;
  exitSignal: boolean;
}
