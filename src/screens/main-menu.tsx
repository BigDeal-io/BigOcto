import React from 'react';
import { Menu } from '../components/menu.js';
import type { Screen, GitEnvironment } from '../types.js';

interface MainMenuProps {
  onSelect: (screen: Screen) => void;
  env: GitEnvironment;
}

export function MainMenu({ onSelect, env }: MainMenuProps) {
  const items = [
    { label: 'Browse Issues', value: 'issue-browser', description: 'List and filter issues' },
    { label: 'Create New Issue', value: 'issue-create', description: 'Open a new issue' },
    { label: 'Autonomous Loop Mode', value: 'loop-config', description: 'Run agent loops on issues' },
    { label: 'View Repository Knowledge', value: 'knowledge-view', description: 'Patterns and CLAUDE.md' },
    { label: 'Action History', value: 'action-history', description: 'Recent operations' },
    { label: 'Repositories', value: 'repo-management', description: 'Manage watched repos' },
    { label: 'Settings', value: 'settings', description: 'Configuration' },
    { label: 'Help', value: 'help', description: 'Keybindings and usage' },
  ];

  function handleSelect(value: string) {
    onSelect({ type: value } as Screen);
  }

  return (
    <Menu
      items={items}
      onSelect={handleSelect}
      title="What would you like to do?"
    />
  );
}
