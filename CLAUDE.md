# BIGOCTO - Project Conventions

## Overview
BIGOCTO is a terminal UI for GitHub issue management with Claude Agent SDK integration. Part of the BIGDEALIO suite.

## Stack
- **Runtime**: Node.js with TypeScript (ES2022, Node16 module resolution)
- **UI**: Ink (React for CLI) + @inkjs/ui
- **CLI**: Commander.js
- **Build**: esbuild → `dist/bigocto.mjs`
- **Test**: Vitest
- **Config**: TOML via smol-toml

## Architecture
- `src/app.tsx` — Main app shell with ThemeProvider, screen routing, global keybindings
- `src/cli.tsx` — Commander setup, entry point
- `src/types.ts` — Discriminated union `Screen` type with data payloads
- `src/constants.ts` — Colors, keys, paths, logo
- `src/hooks/` — React hooks (navigation, issues, config)
- `src/components/` — Reusable UI components (header, footer, menu, etc.)
- `src/screens/` — Screen components organized by feature
- `src/core/` — Business logic (GitHub API, git, executor, loop, agent, config)
- `src/utils/` — Pure utility functions (format, validate)

## Key Patterns
- **Navigation**: Stack-based (push/pop/replace) via `useNavigation` hook
- **Screen types carry data**: `{ type: 'issue-detail', issueNumber: 123 }` — not parameterless
- **Async executor**: `executeGhCommand`/`executeGitCommand` use `execFile` (not sync)
- **Builder/Parser pattern**: `buildListIssues()` returns args, `parseIssueList()` parses JSON
- **Optional SDK**: Claude Agent SDK is dynamically imported with `// @ts-ignore`

## Commands
- `npm run dev` — Run in development mode
- `npm run build` — Build with esbuild
- `npm run typecheck` — TypeScript check
- `npm test` — Run tests with Vitest
- `npm run lint` — ESLint (if configured)

## Conventions
- All imports use `.js` extensions (Node16 module resolution)
- Screen components accept `onBack: () => void` and `env: GitEnvironment`
- Use `COLORS` from constants for all color values
- Use `@inkjs/ui` Select component for menus (not raw useInput for selection)
- Footer hints are context-aware per screen type
- Error handling: try/catch with user-friendly messages, no crashes
