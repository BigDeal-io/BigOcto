import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { parse, stringify } from 'smol-toml';
import { CONFIG_FILE } from '../constants.js';

export interface BigoctoConfig {
  general: {
    auto_detect_repo: boolean;
    default_repo: string;
    cache_ttl: number;
  };
  repositories: {
    watched: string[];
  };
  claude_agent: {
    model: string;
    max_turns: number;
    default_tools: string[];
  };
  loop: {
    max_iterations_default: number;
    sleep_between_iterations: number;
    use_worktree: boolean;
    worktree_quality_gate: string;
    current_folder_quality_gate: string;
  };
  ui: {
    show_help_hints: boolean;
    confirm_destructive: boolean;
  };
}

export function getDefaultConfig(): BigoctoConfig {
  return {
    general: {
      auto_detect_repo: true,
      default_repo: '',
      cache_ttl: 300,
    },
    repositories: {
      watched: [],
    },
    claude_agent: {
      model: 'claude-sonnet-4-5-20250929',
      max_turns: 50,
      default_tools: ['Read', 'Edit', 'Write', 'Bash', 'Glob', 'Grep'],
    },
    loop: {
      max_iterations_default: 20,
      sleep_between_iterations: 2000,
      use_worktree: true,
      worktree_quality_gate: 'code-only',
      current_folder_quality_gate: 'full',
    },
    ui: {
      show_help_hints: true,
      confirm_destructive: true,
    },
  };
}

export function loadConfig(): BigoctoConfig {
  try {
    if (!existsSync(CONFIG_FILE)) return getDefaultConfig();
    const data = readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = parse(data) as unknown as Partial<BigoctoConfig>;
    return mergeDefaults(parsed);
  } catch {
    return getDefaultConfig();
  }
}

export function saveConfig(config: BigoctoConfig): void {
  const dir = dirname(CONFIG_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, stringify(config as unknown as Record<string, unknown>));
}

function mergeDefaults(partial: Partial<BigoctoConfig>): BigoctoConfig {
  const defaults = getDefaultConfig();
  return {
    general: { ...defaults.general, ...partial.general },
    repositories: { ...defaults.repositories, ...partial.repositories },
    claude_agent: { ...defaults.claude_agent, ...partial.claude_agent },
    loop: { ...defaults.loop, ...partial.loop },
    ui: { ...defaults.ui, ...partial.ui },
  };
}
