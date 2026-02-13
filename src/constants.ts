import { homedir } from 'os';
import { join } from 'path';

export const CONFIG_DIR = join(homedir(), '.config', 'bigocto');
export const DATA_DIR = join(homedir(), '.local', 'share', 'bigocto');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.toml');
export const PATTERNS_FILE = join(CONFIG_DIR, 'patterns.txt');
export const HISTORY_FILE = join(DATA_DIR, 'history.json');
export const SESSIONS_DIR = join(DATA_DIR, 'sessions');
export const WORKTREE_DIR = join(homedir(), '.bigocto', 'worktrees');
export const LOCKS_DIR = join(homedir(), '.bigocto', 'locks');
export const MAX_HISTORY_ENTRIES = 500;

export const COLORS = {
  primary: '#61AFEF',
  secondary: '#98C379',
  accent: '#E5C07B',
  error: '#E06C75',
  muted: '#5C6370',
  text: '#ABB2BF',
  border: '#3E4451',
  success: '#98C379',
  warning: '#E5C07B',
  issueOpen: '#61AFEF',
  issueClosed: '#C678DD',
  issueInProgress: '#E5C07B',
} as const;

export const KEYS = {
  QUIT: 'q',
  BACK: 'escape',
  HELP: '?',
  CONFIRM: 'return',
  REFRESH: 'r',
  OPEN_BROWSER: 'o',
  SEARCH: '/',
} as const;

export const KEY_LABELS = {
  navigate: '\u2191\u2193 Navigate',
  select: '\u21B5 Select',
  back: 'Esc Back',
  quit: 'q Quit',
  help: '? Help',
  confirm: '\u21B5 Confirm',
  cancel: 'Esc Cancel',
  refresh: 'r Refresh',
  openBrowser: 'o Open in Browser',
  search: '/ Search',
} as const;

export const APP_NAME = 'bigocto';
export const APP_VERSION = '0.1.0';
export const APP_TAGLINE = 'GitHub issues, the easy way';
export const APP_AUTHOR = 'Fractional CTO Solutions';
export const APP_AUTHOR_URL = 'https://fractionalctosolutions.com';
export const APP_COMPANY = 'BIGDEALIO, LLC';

export const APP_LOGO = [
  '\u2588\u2580\u2584 \u2588 \u2588\u2580\u2580 \u2588\u2580\u2588 \u2588\u2580\u2580 \u2580\u2588\u2580 \u2588\u2580\u2588',
  '\u2588\u2580\u2584 \u2588 \u2588\u2584\u2588 \u2588\u2584\u2588 \u2588\u2584\u2584  \u2588  \u2588\u2584\u2588',
  '\u2580\u2580  \u2580 \u2580\u2580\u2580 \u2580 \u2580 \u2580\u2580\u2580  \u2580  \u2580 \u2580',
];
