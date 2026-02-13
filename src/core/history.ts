import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { HISTORY_FILE, MAX_HISTORY_ENTRIES } from '../constants.js';
import type { HistoryEntry } from '../types.js';

export function loadHistory(): HistoryEntry[] {
  try {
    if (!existsSync(HISTORY_FILE)) return [];
    const data = readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  const dir = dirname(HISTORY_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const trimmed = entries.slice(-MAX_HISTORY_ENTRIES);
  writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2));
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'timestamp'>): void {
  const entries = loadHistory();
  entries.push({ ...entry, timestamp: Date.now() });
  saveHistory(entries);
}
