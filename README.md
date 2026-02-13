```
█▀▄ █ █▀▀ █▀█ █▀▀ ▀█▀ █▀█
█▀▄ █ █▄█ █▄█ █▄▄  █  █▄█
▀▀  ▀ ▀▀▀ ▀ ▀ ▀▀▀  ▀  ▀ ▀
```

**GitHub issues, the easy way**

[![npm version](https://img.shields.io/npm/v/%40bigdealio/bigocto.svg)](https://www.npmjs.com/package/@bigdealio/bigocto)
[![license](https://img.shields.io/npm/l/%40bigdealio/bigocto.svg)](https://github.com/BigDeal-io/BigOcto/blob/main/LICENSE)

BIGOCTO is an interactive terminal UI for GitHub issues with Claude Agent SDK integration. Browse, create, and manage issues from the terminal. Send issues directly to Claude for AI-assisted coding, or run autonomous loop mode to iterate on issues with quality gates and progress tracking.

## Install

```bash
npm install -g @bigdealio/bigocto
```

Requires [Node.js](https://nodejs.org/) >= 18, [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated, and Git.

## Usage

```bash
bigocto
```

Arrow keys to navigate, Enter to select, Esc to go back, `q` to quit.

```bash
# Run autonomous loop mode on an issue
bigocto loop -i 42
bigocto loop -i 42 --model claude-opus-4-6 -n 10
bigocto loop -i 42 --no-worktree -q full
```

## Features

### Issues
- **Browse** issues with search and filter
- **View** full issue details with comments and markdown rendering
- **Create** new issues with labels and assignee selection
- **Manage** — close, reopen, add comments, open in browser

### Claude Agent
- **Send to Claude** — launch an AI coding session with full issue context
- **Three-tier knowledge** — global patterns, repo CLAUDE.md, session logs
- **Configurable** — model, max turns, include comments

### Autonomous Loop Mode
- **Iterate** — agent loops on an issue until resolved or max iterations
- **Quality gates** — lint, typecheck, and tests gate each commit
- **Worktree isolation** — run in a git worktree to keep your working directory clean
- **Progress tracking** — accumulated learnings persist between iterations
- **CLI mode** — run headless via `bigocto loop`

### Configuration
- **TOML config** at `~/.config/bigocto/config.toml`
- **Multi-repo** — watch and switch between repositories
- **Persistent settings** — model, quality gate mode, worktree preferences

## Keybindings

| Key | Action |
|-----|--------|
| `Up` / `Down` | Navigate menu items |
| `Enter` | Select / confirm |
| `Esc` | Go back / cancel |
| `q` | Quit (from main menu) |
| `?` | Open help screen |
| `r` | Refresh data |
| `o` | Open in browser |
| `/` | Search / filter |
| `s` | Stop loop |

## Loop Mode

```bash
bigocto loop -i <issue-number> [options]

Options:
  -i, --issue <number>         GitHub issue number (required)
  -m, --model <model>          Claude model (default: claude-sonnet-4-5-20250929)
  -n, --max-iterations <n>     Max iterations (default: 20)
  --no-worktree                Use current folder instead of worktree
  -q, --quality-gate <mode>    full, code-only, or off (default: code-only)
```

| Strategy | Description |
|----------|-------------|
| Worktree + Code Only | Isolated worktree, lint + typecheck only (recommended) |
| Worktree + Full | Isolated worktree, lint + typecheck + tests |
| Current Folder + Full | Work in current directory with all quality gates |
| Current Folder + Off | Work in current directory, no quality gates |

## Development

```bash
git clone https://github.com/BigDeal-io/BigOcto.git
cd BigOcto
npm install
npm run dev        # run with tsx
npm run build      # bundle to dist/
npm run typecheck   # type check
npm test           # run tests
```

## Built With

- [Ink](https://github.com/vadimdemedes/ink) - React for interactive CLIs
- [Commander](https://github.com/tj/commander.js) - CLI argument parsing
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Claude Agent SDK](https://docs.anthropic.com/) - AI coding agent

## License

[MIT](LICENSE) - Copyright (c) 2026 Fractional CTO Solutions, a service of BIGDEALIO, LLC

---

A product of **[Fractional CTO Solutions](https://fractionalctosolutions.com)** - a service of **BIGDEALIO, LLC**
