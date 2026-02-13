import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Select } from '@inkjs/ui';
import { COLORS } from '../constants.js';

export interface MenuItem {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  onSelect: (value: string) => void;
  onBack?: () => void;
  title?: string;
}

export function Menu({ items, onSelect, onBack, title }: MenuProps) {
  useInput((_input, key) => {
    if (key.escape && onBack) {
      onBack();
    }
  });

  const activeItems = items.filter(i => !i.disabled);

  return (
    <Box flexDirection="column" gap={1}>
      {title && (
        <Text bold color={COLORS.accent}>{title}</Text>
      )}
      <Select
        options={activeItems.map(item => ({
          label: item.label + (item.description ? ` - ${item.description}` : ''),
          value: item.value,
        }))}
        onChange={onSelect}
      />
    </Box>
  );
}
