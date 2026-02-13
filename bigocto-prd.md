# BIGOCTO Product Requirements Document

**Product Name:** BIGOCTO  
**Product Line:** BIGDEALIO Suite  
**Version:** 1.0  
**Owner:** Mobilozophy, BIGDEALIO LLC  
**Status:** Planning  
**Last Updated:** February 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [Target Users](#target-users)
5. [Core Features](#core-features)
6. [Technical Architecture](#technical-architecture)
7. [User Interface](#user-interface)
8. [Key User Workflows](#key-user-workflows)
9. [Non-Functional Requirements](#non-functional-requirements)
10. [Release Plan](#release-plan)
11. [Success Criteria](#success-criteria)
12. [Appendix](#appendix)

---

## Executive Summary

BIGOCTO is a menu-driven terminal UI for GitHub issue management that seamlessly integrates with the Claude Agent SDK. Like BIGMUX makes tmux accessible through an interactive interface, BIGOCTO makes GitHub's gh CLI workflow-friendly while bridging the gap between issue triage and AI-assisted development.

**Key Innovation:** BIGOCTO operates in two modes:
1. **Interactive TUI Mode**: Menu-driven navigation for browsing, filtering, and managing issues
2. **Autonomous Loop Mode**: Headless agent that works on issues continuously until completion

```
█▀▄ █ █▀▀ █▀█ █▀▀ ▀█▀ █▀█
█▀▄ █ █▄█ █▄█ █▄▄  █  █▄█
▀▀  ▀ ▀▀▀ ▀ ▀ ▀▀▀  ▀  ▀ ▀

GitHub issues, the easy way
```

---

## Problem Statement

Developers currently experience friction when:

- Switching between GitHub web UI, gh CLI, and Claude Code for issue-driven development
- Manually gathering context before starting work on an issue
- Remembering gh CLI syntax for common operations
- Setting up Claude Code sessions with proper issue context
- Tracking which issues are actively being worked on
- Running autonomous agents that lose context over long sessions
- Managing knowledge across multiple repositories and sessions

---

## Goals & Success Metrics

### Primary Goals

1. Streamline GitHub issue → AI agent workflow
2. Enable one-keystroke handoff from issues to Claude Agent SDK
3. Support autonomous loop execution for unattended issue completion
4. Accumulate and persist knowledge across sessions and repositories
5. Reduce time from issue selection to active coding by 70%
6. Provide efficient issue triage and management interface

### Success Metrics

- **Time to start coding**: < 30 seconds from BIGOCTO launch
- **Agent launch success rate**: > 90% (issues successfully sent to Claude)
- **Autonomous completion rate**: > 60% of issues completed without intervention
- **Daily active users** among BIGDEALIO suite: 60%+
- **User-reported satisfaction**: 4.5/5+

---

## Target Users

### The CLI Enthusiast
- Already uses BIGMUX for tmux management
- Lives in the terminal, minimal browser usage
- Values keyboard-driven, menu-based interfaces
- Wants to learn gh CLI through interactive use

### The AI-Assisted Developer
- Heavy Claude Code user
- Needs efficient context transfer from issues to AI sessions
- Manages multiple repos/projects simultaneously
- Appreciates workflow automation

### The Fractional CTO
- Demonstrates modern development tools to clients
- Manages issues across multiple repositories
- Values consistency in tooling (BIGDEALIO ecosystem)
- Efficient context switching is critical

### The Autonomous Agent User
- Wants to run development agents overnight
- Needs reliable, unattended issue completion
- Values fresh context per iteration
- Requires audit trails and quality gates

---

## Core Features

### Phase 1: MVP (v1.0)

#### 1. Main Menu Navigation
Menu-driven interface matching BIGMUX pattern.

**Menu Structure:**
```
╔════════════════════════════════════════════╗
║            BIGOCTO - Main Menu             ║
║  📁 bigdealio/mzconnect (detected)         ║
╠════════════════════════════════════════════╣
║  > Browse Issues                           ║
║    Create New Issue                        ║
║    Autonomous Loop Mode                    ║
║    View Repository Knowledge               ║
║    Action History                          ║
║    Settings                                ║
║    Help                                    ║
║    Quit                                    ║
╚════════════════════════════════════════════╝
```

**Requirements:**
- Arrow key navigation
- Enter to select, Esc to go back
- Status bar shows current repo/filter state
- Repository auto-detection from current directory

---

#### 2. Automatic Repository Detection

**Description:** Auto-detect current git repository and use as default context

**Requirements:**
- On launch, check if current directory is inside a git repo
- Extract GitHub remote URL (origin) to determine owner/name
- Set as default repository for browsing/filtering
- Show current repo prominently in status bar
- Allow manual override to switch repos

**Detection Flow:**
```bash
git rev-parse --is-inside-work-tree  # Are we in a git repo?
git remote get-url origin             # Get GitHub URL
# Parse: git@github.com:bigdealio/mzconnect.git
# Extract: bigdealio/mzconnect
```

**Technical Notes:**
- Use simple-git package or execute git commands directly
- Cache detection result for session
- Graceful handling when not in a git repo (show repo list instead)
- Support both SSH and HTTPS remote URLs

---

#### 3. Issue Browser (Interactive List)

**Description:** Filterable issue list with command preview

**Requirements:**
- List issues with metadata (number, title, labels, state, assignee)
- Sub-menu for filters: state, assignee, labels, milestone, sort
- Real-time filter application
- Multi-repo support (switch between configured repos)
- Color-coded labels and status indicators
- Pagination for large issue lists

**Menu Flow:**
```
Browse Issues → Filter Menu → Issue List → Select Issue → Actions Menu
```

**Technical Notes:**
- Use `gh issue list --json` for data fetching
- Cache results with configurable TTL (default: 5 min)
- Show loading indicators during fetch

---

#### 4. Issue Actions Menu

**Description:** Quick actions menu for selected issue

**Menu Structure:**
```
╔════════════════════════════════════════════╗
║  Issue #123: Fix webhook timeout           ║
║  [bug] [priority] - Assigned to you        ║
╠════════════════════════════════════════════╣
║  > View Full Details                       ║
║    Send to Claude Agent                    ║
║    Start Loop on This Issue                ║
║    Edit Issue                              ║
║    Add Comment                             ║
║    Change Labels                           ║
║    Change Assignee                         ║
║    Close/Reopen                            ║
║    Open in Browser                         ║
║    Back                                    ║
╚════════════════════════════════════════════╝
```

**Actions execute directly** without command preview - BIGOCTO is about workflows, not teaching CLI syntax.

---

#### 5. Claude Agent SDK Integration

**Description:** Launch Claude Agent SDK sessions with comprehensive context

**Integration Flow:**
```
Select Issue → Send to Claude Agent → Configure Options → 
Preview Prompt → Execute Agent
```

**Options Menu:**
```
╔════════════════════════════════════════════╗
║     Claude Agent Launch Options            ║
╠════════════════════════════════════════════╣
║  [x] Auto-create branch                    ║
║  [x] Include issue comments                ║
║  [x] Include related issues                ║
║  [ ] Include PR context                    ║
║  Model: claude-sonnet-4-5        [▼]       ║
║  Max turns: 50                   [▼]       ║
╠════════════════════════════════════════════╣
║  [Enter] Continue  [Esc] Cancel            ║
╚════════════════════════════════════════════╝
```

**Context Building:**
- Global patterns from `~/.config/bigocto/patterns.txt`
- Repository knowledge from `.bigocto/CLAUDE.md`
- Recent session history
- Issue details and comments
- Related issues and PRs
- Relevant files mentioned in issue

**Agent SDK Configuration:**
```typescript
const agentOptions = {
  model: 'claude-sonnet-4-5-20250929',
  settingSources: ['project'],
  tools: ['Read', 'Edit', 'Bash', 'Glob', 'Grep'],
  maxTurns: 50,
  systemPrompt: {
    append: buildSystemPromptAdditions(context)
  }
};
```

---

#### 6. Knowledge & Memory System

**Description:** Three-tier persistent memory across sessions

**Architecture:**

##### Level 1: Global Patterns (`~/.config/bigocto/patterns.txt`)
Cross-project, reusable knowledge about GitHub workflows

**Example Content:**
```txt
# BIGOCTO Global Patterns

## GitHub Workflow Patterns
- Always use "fixes #123" in commit messages to auto-close issues
- Label conventions: bug (red), enhancement (green), docs (blue)
- Issues with "good first issue" label are ideal for onboarding

## Claude Agent Integration Patterns  
- Include acceptance criteria in prompts for better results
- Reference related PRs in issue context
- Create branch names: issue-{number}-{slug}

## Issue Management Best Practices
- One issue = one concern (don't mix features)
- Acceptance criteria should be testable
- Link issues to milestones for better tracking
```

##### Level 2: Repository Knowledge (`.bigocto/CLAUDE.md`)
Project-specific conventions, architecture, and patterns

**Auto-Created Template:**
```markdown
# BIGOCTO Knowledge - bigdealio/mzconnect

Last Updated: 2026-02-13

## Repository Context
This is mzCONNECT, an AI-powered marketing automation platform.

## Issue Patterns
- Database issues → label: infrastructure
- AI features → label: ai-enhancement  
- Webhook problems → often involve pkg/webhooks/processor.go

## Common Workflows
- New integrations follow pattern in pkg/integrations/
- Always update tests in tests/integration/ for API changes
- Schema changes require migration in db/migrations/

## Frequently Referenced Files
When working on webhooks: pkg/webhooks/processor.go, pkg/webhooks/validator.go
When working on AI features: pkg/ai/sentiment.go, pkg/ai/conversation.go

## Team Conventions
- Use conventional commits format
- All issues require acceptance criteria
- Link issues to epics using "part of #epic-number"
```

##### Level 3: Session Progress (`~/.local/share/bigocto/sessions/`)
Track what happened in recent sessions

**Auto-Generated:**
```txt
# BIGOCTO Session Progress - bigdealio/mzconnect

## Session: 2026-02-13 14:30
Sent Issue #123 to Claude Agent
- Branch created: issue-123-fix-webhook-timeout
- Context included: 3 comments, 2 related issues
- Prompt focused on: chunked processing pattern

Learnings:
- Issue had good technical context in comments
- Related issue #108 had similar solution approach

## Session: 2026-02-13 09:15
Bulk labeled 5 issues as "priority"
- Issues: #120, #121, #122, #125, #127
- Pattern: All related to Q1 milestones
```

---

#### 7. Issue Detail View

**Description:** Full issue view with markdown rendering

**Requirements:**
- Display full issue body (markdown → terminal formatting)
- Show all comments with threading
- Display metadata sidebar
- Show linked PRs and related issues
- Timeline/activity view
- Quick actions menu at bottom

**Technical Notes:**
- Use `gh issue view --json`
- Parse and render markdown using marked-terminal
- Syntax highlight code blocks

---

#### 8. Create Issue Menu

**Description:** Guided issue creation flow

**Menu Flow:**
```
Create Issue → Select Repo → Enter Title → Enter Description → 
Add Labels → Add Assignee → Confirm
```

Form fills out and submits directly - no command preview needed.

---

#### 9. Repository Management

**Description:** Configure watched repositories

**Menu Structure:**
```
╔════════════════════════════════════════════╗
║        Repository Management               ║
╠════════════════════════════════════════════╣
║  Current Repositories:                     ║
║  ✓ bigdealio/mzconnect                     ║
║  ✓ bigdealio/bigmux                        ║
║  ✓ client-org/project-alpha                ║
║                                            ║
║  > Add Repository                          ║
║    Remove Repository                       ║
║    Set Default Repository                  ║
║    Refresh All                             ║
║    Back                                    ║
╚════════════════════════════════════════════╝
```

---

#### 10. Action History

**Description:** Browse recent actions and operations

**Requirements:**
- List all operations with timestamps and status
- Show action type (closed issue, sent to agent, labeled, etc.)
- Display success/failure indicators
- Filter by action type
- Export history to file

**Menu:**
```
╔════════════════════════════════════════════════════════════╗
║                  Action History                            ║
╠════════════════════════════════════════════════════════════╣
║  [✓] 2:34 PM  Closed issue #123                            ║
║  [✓] 2:30 PM  Sent issue #123 to Claude Agent              ║
║  [✓] 2:25 PM  Added label "priority" to #122               ║
║  [✓] 2:20 PM  Listed open issues                           ║
╠════════════════════════════════════════════════════════════╣
║  [r] Refresh  [Esc] Back                                   ║
╚════════════════════════════════════════════════════════════╝
```

Shows **what you did** rather than **what commands ran**.

---

#### 11. Autonomous Loop Mode

**Description:** Launch headless agent mode from TUI or as standalone command

**Two Ways to Launch:**

**1. From TUI (Interactive):**
```
Main Menu → Autonomous Loop Mode

╔════════════════════════════════════════════╗
║        Autonomous Loop Configuration       ║
╠════════════════════════════════════════════╣
║  Target:                                   ║
║  ( ) Single Issue: #___                    ║
║  (•) Milestone: [Q1 2026        ▼]         ║
║  ( ) Labels: [Select...        ▼]          ║
║                                            ║
║  Workspace Strategy:                       ║
║  (•) Worktree - Code Only (recommended)    ║
║      Skip tests, you QC later              ║
║  ( ) Worktree - Full Autonomous            ║
║      Run all tests (needs standalone tests)║
║  ( ) Current Folder                        ║
║      Work here (for testing)               ║
║                                            ║
║  Max Iterations: [50]                      ║
║  Model: [claude-sonnet-4-5     ▼]          ║
║                                            ║
║  [Start Loop]  [Cancel]                    ║
╚════════════════════════════════════════════╝
```

**2. Standalone Command (Headless):**
```bash
# Launch BIGOCTO directly in loop mode
bigocto loop

# Will prompt for:
# - Which issue/milestone/labels?
# - Workspace strategy?
# - Max iterations?
# Then runs headlessly
```

**No CLI flags needed** - all configuration through interactive prompts or saved in config.

**Loop Architecture:**
```
┌─────────────────────────────────────────┐
│         BIGOCTO Loop Mode               │
├─────────────────────────────────────────┤
│                                         │
│  Setup Phase:                           │
│  ├─ Detect current repository          │
│  ├─ Ask: Use worktree or current dir?  │
│  ├─ If worktree:                        │
│  │   ├─ Create git worktree            │
│  │   ├─ Checkout feature branch        │
│  │   └─ CD into worktree               │
│  └─ If current dir:                     │
│      └─ Create feature branch           │
│                                         │
│  Iteration 1:                           │
│  ├─ Read Issue #123 from GitHub        │
│  ├─ Read progress.txt (learnings)      │
│  ├─ Read CLAUDE.md (patterns)          │
│  ├─ Spawn Claude Agent SDK             │
│  ├─ Claude reads files, writes code    │
│  ├─ Run tests (quality gate)           │
│  ├─ Commit if passing                  │
│  ├─ Update progress.txt                │
│  └─ Check: Issue complete? ───┐        │
│                                │        │
│  Iteration 2: (if incomplete) ◄┘        │
│  ├─ Fresh context (0 tokens)           │
│  ├─ Read updated progress.txt          │
│  ├─ Read git history                   │
│  ├─ Spawn new Claude session           │
│  ├─ Continue work                      │
│  └─ Repeat...                          │
│                                         │
│  Cleanup Phase:                         │
│  ├─ If worktree: Remove worktree       │
│  └─ Return to main repository          │
│                                         │
│  Exit when:                             │
│  • Tests pass                           │
│  • Acceptance criteria met             │
│  • Claude outputs EXIT_SIGNAL          │
│  • Max iterations reached               │
│                                         │
└─────────────────────────────────────────┘
```

**Key Features:**
- **Fresh Context Per Iteration**: Each iteration starts at 0 tokens
- **Git Worktree Isolation**: Work in separate directory to avoid conflicts (default)
- **Parallel Processing**: Run multiple loops simultaneously in different terminals
- **Flexible Workspace**: Option to use current directory for testing/debugging
- **Quality Gates**: Tests must pass before committing
- **Progress Tracking**: Full audit trail in `.bigocto/progress.txt`
- **Learning Accumulation**: Patterns extracted and saved to CLAUDE.md
- **Exit Signals**: Claude must explicitly signal completion
- **Branch Isolation**: Each issue gets its own feature branch
- **Parallel Work**: Multiple loops can run simultaneously with worktrees

**Git Worktree Strategy:**

BIGOCTO uses **git worktrees** by default to isolate loop work from your main directory. This provides several benefits:

**Why Worktrees?**
```
Main Repo (~/projects/mzconnect)
├─ main branch
└─ Your active development work (IDE open, dependencies installed)

Worktree (~/.bigocto/worktrees/mzconnect-issue-123)
├─ issue-123-fix-webhook-timeout branch
└─ Autonomous loop working here (isolated)
```

**Benefits:**
1. **No interference**: Loop doesn't touch your working directory
2. **Parallel loops**: **Run multiple issues simultaneously in separate terminals**
3. **Clean state**: Each loop starts with clean git state
4. **Easy cleanup**: Delete worktree when done
5. **Safety**: Main repo stays pristine
6. **Resource isolation**: Each worktree is independent

**Worktree Modes:**

**1. Full Autonomous Mode (soup to nuts):**
```bash
bigocto loop 123 --worktree --quality-gates full
```
- Creates worktree
- Runs all quality gates (lint, typecheck, tests)
- Commits on success
- **Requires:** Tests can run in isolation (no special DB config, etc.)
- **Best for:** Simple repos, stateless tests, well-containerized services

**2. Code-Only Mode (commit without tests):**
```bash
bigocto loop 123 --worktree --quality-gates code-only
```
- Creates worktree
- Runs lint and typecheck only
- **Skips unit tests** (they might need main repo config)
- Commits if code quality passes
- **You then:** `git checkout issue-123-fix` in main repo to run full tests
- **Best for:** Complex repos where tests need specific environment

**3. Current Folder Mode (solo development):**
```bash
bigocto loop 123 --no-worktree
```
- Works in your current directory
- Creates branch here
- Runs all quality gates (uses your local config)
- Commits on success
- **Best for:** Testing BIGOCTO, debugging loops, simple changes

**Interactive Prompt (if not specified):**
```
╔════════════════════════════════════════════╗
║     Workspace Strategy for Loop Mode       ║
╠════════════════════════════════════════════╣
║  How should BIGOCTO work on this issue?    ║
║                                            ║
║  [1] Worktree - Full Autonomous            ║
║      Isolated directory + all tests        ║
║      ⚠️  Requires: Tests work standalone   ║
║                                            ║
║  [2] Worktree - Code Only                  ║
║      Isolated directory, skip unit tests   ║
║      ✓  You QC tests in main repo later    ║
║                                            ║
║  [3] Current Folder                        ║
║      Work here: ~/projects/mzconnect       ║
║      ✓  Uses your local config & deps      ║
║                                            ║
║  Choice [2]: _                             ║
╚════════════════════════════════════════════╝
```

**Recommended by Repo Type:**

| Repo Type | Mode | Reason |
|-----------|------|--------|
| Simple Node/Python lib | Full Autonomous | Tests are stateless, `npm test` works anywhere |
| API with test DB | Code Only | Tests need specific DB connection config |
| Monorepo | Code Only | Complex deps, integration tests need setup |
| Frontend SPA | Full Autonomous | Tests usually work standalone |
| Microservice | Code Only | Tests might need other services running |

**Quality Gate Modes Explained:**

```typescript
interface QualityGateMode {
  'full': {
    runs: ['lint', 'typecheck', 'test'],
    commits: 'on all pass',
    useCase: 'Tests work in isolation'
  },
  'code-only': {
    runs: ['lint', 'typecheck'],
    commits: 'on code quality pass',
    useCase: 'Tests need main repo environment',
    workflow: 'Agent commits → You checkout → You run tests'
  },
  'off': {
    runs: [],
    commits: 'every iteration',
    useCase: 'Trust the agent completely (not recommended)'
  }
}
```

**Typical Workflow with Code-Only Mode:**

```bash
# 1. Run loop in worktree (code-only mode)
bigocto loop 123 --worktree --quality-gates code-only --max-iterations 10

# Output:
# ✓ Iteration 5: Code quality passed
# ✓ Committed: a7b3c9d
# ⚠️  Tests skipped (code-only mode)
# ✓ Branch: issue-123-fix-webhook-timeout

# 2. In your main repo, checkout the branch
cd ~/projects/mzconnect
git fetch
git checkout issue-123-fix-webhook-timeout

# 3. Run tests with your local config
npm test

# 4. If tests pass, push and create PR
git push origin issue-123-fix-webhook-timeout
gh pr create --fill
```

**Completion Criteria:**
1. All acceptance criteria met
2. Tests passing
3. Claude outputs `<EXIT_SIGNAL>COMPLETE</EXIT_SIGNAL>`
4. Quality gates pass (lint, typecheck, tests)

**Progress File Example:**
```txt
# BIGOCTO Progress - Issue #123

Started: 2026-02-13T14:30:00Z

## Issue Context
Fix webhook timeout on large payloads

When receiving payloads > 5MB from Square POS integration,
processing times out after 30s.

## Learnings
(Accumulated patterns from iterations)

---

## Iteration 1 - 2/13/2026 2:30 PM

**Status:** 🔄 In Progress
**Tests:** ❌ Fail
**Lint:** ✅ Pass
**Commit:** None (quality gates failed)

### Learnings
- Timeout happens in pkg/webhooks/processor.go:45
- Need to implement chunked processing
- Similar pattern exists in pkg/integrations/intercard/

---

## Iteration 2 - 2/13/2026 2:35 PM

**Status:** ✅ COMPLETE
**Tests:** ✅ Pass
**Lint:** ✅ Pass
**Commit:** a7b3c9d

### Learnings
- Implemented chunked processing using streaming approach
- Added tests for large payload handling
- Updated documentation in webhook README
```

---

### Phase 2: Enhanced Features (v1.1)

#### 12. Work Session Tracking
- Show which issues have active Claude Agent sessions
- Time tracking per issue
- Automatic branch → issue linking
- Session summary reports

#### 13. Bulk Operations
- Multi-select issues for batch operations
- Bulk label changes
- Bulk assignment
- Bulk close with common comment

#### 14. Custom Workflows
- Save common command sequences
- User-defined keyboard shortcuts
- Template library for prompts/issues

---

### Phase 3: AI Intelligence (v1.2)

#### 15. Issue Intelligence
- Auto-suggest labels using Claude
- Detect duplicate issues
- Extract acceptance criteria
- Complexity estimation

#### 16. Smart Context
- Recommend relevant files before coding
- Identify potential stakeholders
- Suggest related/similar issues

---

## Technical Architecture

### Technology Stack

**Frontend/UI:**
- **Framework:** Ink (React for CLIs) - same as BIGMUX
- **Language:** TypeScript
- **Build:** esbuild
- **Testing:** Vitest

**Backend/Integration:**
- **GitHub Integration:** gh CLI (shell out)
- **Claude Integration:** @anthropic-ai/claude-agent-sdk (TypeScript SDK)
- **Git Operations:** simple-git
- **Local Storage:** SQLite (session tracking, cache)
- **Config:** TOML files in `~/.config/bigocto/`

**Distribution:**
- **Package Manager:** npm (published as `@bigdealio/bigocto`)
- **Binary:** Bundled with esbuild

---

### Project Structure

```
bigocto/
├── src/
│   ├── index.ts                    # Entry point
│   ├── cli.ts                      # Commander setup
│   ├── components/
│   │   ├── App.tsx                 # Main TUI app
│   │   ├── MainMenu.tsx
│   │   ├── IssueBrowser.tsx
│   │   ├── IssueDetail.tsx
│   │   ├── ClaudeAgentLauncher.tsx
│   │   ├── ActionHistory.tsx
│   │   └── shared/
│   │       ├── Menu.tsx
│   │       ├── List.tsx
│   │       ├── Input.tsx
│   │       └── StatusBar.tsx
│   ├── core/
│   │   ├── github.ts               # gh CLI wrapper
│   │   ├── claude-agent.ts         # Agent SDK integration
│   │   ├── loop-manager.ts         # Autonomous loop
│   │   ├── worktree.ts             # Git worktree management
│   │   ├── git.ts                  # Git operations
│   │   ├── cache.ts                # Local caching
│   │   ├── session.ts              # Session tracking
│   │   ├── knowledge.ts            # CLAUDE.md management
│   │   ├── progress-tracker.ts     # progress.txt management
│   │   └── quality-gate.ts         # Test/lint/typecheck
│   ├── types/
│   │   ├── issue.ts
│   │   ├── command.ts
│   │   ├── agent.ts
│   │   └── config.ts
│   └── utils/
│       ├── markdown.ts
│       ├── formatting.ts
│       └── clipboard.ts
├── tests/
│   ├── unit/
│   │   ├── github.test.ts
│   │   ├── loop-manager.test.ts
│   │   └── quality-gate.test.ts
│   └── integration/
│       ├── agent-integration.test.ts
│       └── loop-integration.test.ts
├── package.json
├── tsconfig.json
├── esbuild.config.js
├── vitest.config.ts
└── README.md
```

---

### Configuration

```toml
# ~/.config/bigocto/config.toml

[general]
auto_detect_repo = true          # Detect current git repo on launch
use_memory_system = true         # Enable patterns/knowledge features
default_repo = "bigdealio/mzconnect"
cache_ttl = 300                  # seconds

[repositories]
watched = [
    "bigdealio/mzconnect",
    "bigdealio/bigmux",
    "bigdealio/bigocto"
]

[memory]
global_patterns_file = "~/.config/bigocto/patterns.txt"
repo_knowledge_file = ".bigocto/CLAUDE.md"
session_history_days = 30
auto_create_knowledge = true

[claude_agent]
model = "claude-sonnet-4-5-20250929"
max_turns = 50
enable_sandbox = false
default_tools = ["Read", "Edit", "Bash", "Glob", "Grep"]

[claude_agent.prompts]
include_global_patterns = true
include_repo_knowledge = true
include_session_history = true
max_context_tokens = 8000

[claude_agent.learning]
auto_capture = true
confidence_threshold = 0.7
promote_to_claude_md = true

[loop]
max_iterations_default = 20
sleep_between_iterations = 2000  # milliseconds
stop_on_error = false
use_worktree = true              # Default to worktree isolation
worktree_path = "~/.bigocto/worktrees"  # Where to create worktrees

# Quality gate defaults by workspace type
[loop.quality_gates]
worktree_default = "code-only"   # Skip tests in worktree (safe default)
current_folder_default = "full"  # Run all tests in current folder

[ui]
theme = "default"
show_help_hints = true
confirm_destructive = true

[keybindings]
quit = "q"
help = "?"
refresh = "r"
back = "Esc"
```

---

### Data Models

```typescript
interface Issue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Label[];
  assignees: User[];
  milestone?: Milestone;
  comments: Comment[];
  repository: Repository;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  acceptanceCriteria?: string[];
  technicalNotes?: string;
  localSession?: ClaudeSession;
}

interface ClaudeSession {
  id: string;
  issueNumber: number;
  repository: string;
  startedAt: Date;
  branch: string;
  status: 'active' | 'completed' | 'abandoned';
  timeSpent: number;
  iterations?: number;
}

interface Command {
  id: string;
  timestamp: Date;
  command: string;
  exitCode: number;
  output: string;
}

interface Repository {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  localPath?: string;
}

interface RepositoryKnowledge {
  repoFullName: string;
  sourceFile: string;
  lastUpdated: Date;
  context: string;
  issuePatterns: Pattern[];
  workflows: Workflow[];
  conventions: Convention[];
  frequentFiles: FileReference[];
}

interface Pattern {
  trigger: string;
  action: string;
  confidence: number;
  examples: number[];
}

interface IterationResult {
  iteration: number;
  success: boolean;
  testsPass: boolean;
  commitHash?: string;
  learnings: string[];
  complete: boolean;
  exitSignal: boolean;
}
```

---

## User Interface

### ASCII Art Branding (BIGMUX Style)

```
█▀▄ █ █▀▀ █▀█ █▀▀ ▀█▀ █▀█
█▀▄ █ █▄█ █▄█ █▄▄  █  █▄█
▀▀  ▀ ▀▀▀ ▀ ▀ ▀▀▀  ▀  ▀ ▀

GitHub issues, the easy way
```

### Color Scheme

**Status Colors:**
- Open issues: Blue
- Closed issues: Purple
- In Progress (local): Yellow
- Success commands: Green
- Failed commands: Red

**Label Colors:** Use GitHub label colors when available

### Key Bindings (Consistent with BIGMUX)

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate menu items |
| `Enter` | Select / confirm |
| `Esc` | Go back / cancel |
| `q` | Quit (from main menu) |
| `?` | Help screen |
| `r` | Refresh current view |
| `o` | Open in browser |
| `/` | Search/filter |

---

## Key User Workflows

### Workflow 1: Daily Issue Check (Interactive)

1. Launch: `bigocto`
2. Main menu defaults to "Browse Issues" → auto-enter
3. See assigned issues (default filter)
4. Arrow down to interesting issue → Enter
5. Actions menu → "Send to Claude Agent" → Enter
6. Options menu → confirm defaults → Enter
7. Preview prompt → 'x' to execute
8. Claude Agent launches with context

**Time: < 30 seconds**

---

### Workflow 2: Autonomous Overnight Run

1. **Before leaving work:**
   ```bash
   cd ~/projects/mzconnect
   bigocto  # Launch TUI
   ```
   
2. **In BIGOCTO TUI:**
   ```
   Main Menu → Autonomous Loop Mode
   
   - Target: Milestone "Q1 2026" ✓
   - Workspace: Worktree - Code Only ✓
   - Max Iterations: 100 ✓
   
   [Start Loop] ← Click
   ```

3. **BIGOCTO runs unattended overnight:**
   - Creates git worktrees for each issue (isolated work)
   - Processes each issue sequentially
   - Fresh Claude Agent session per iteration
   - Runs quality gates: **lint + typecheck only** (code-only mode)
   - **Skips unit tests** (they need your local DB config)
   - Commits successful changes
   - Logs all progress to `.bigocto/progress.txt`
   - Cleans up worktrees automatically

4. **Next morning:**
   - Your working directory is untouched
   - Review completed branches:
     ```bash
     cd ~/projects/mzconnect
     git fetch
     
     # Check out first completed issue
     git checkout issue-123-fix-webhook-timeout
     
     # Run tests with your local config
     npm test
     
     # If tests pass, push
     git push origin issue-123-fix-webhook-timeout
     gh pr create --fill
     ```

**Result:** Wake up to code-complete branches. You QC tests in your environment, then push.

**Alternative: For repos with standalone tests:**
- In TUI, select "Worktree - Full Autonomous"
- Agent runs all tests in worktree
- Wake up to fully tested branches

---

### Workflow 3: Quick Issue Update (Interactive)

1. Launch: `bigocto`
2. Browse Issues → select issue #123
3. Actions → "Add Comment"
4. Type comment: "Working on this now"
5. Press Enter to submit
6. Comment added, confirmation shown

**Time: < 15 seconds**

No command preview needed - just get it done.

---

### Workflow 4: Context-Aware Development

1. Terminal in `/projects/mzconnect/`
2. Launch: `bigocto`
3. Auto-detects: `bigdealio/mzconnect`
4. Loads `.bigocto/CLAUDE.md` automatically
5. Browse issues → defaults to current repo
6. Select webhook-related issue
7. BIGOCTO recognizes pattern: "webhook → pkg/webhooks"
8. Adds context to Claude Agent prompt automatically
9. Claude starts with relevant files already known

**Benefit:** Zero manual context gathering

---

### Workflow 5: Learning Capture

1. Complete work via Claude Agent
2. Issue closed automatically
3. BIGOCTO prompts:
   ```
   ╔════════════════════════════════════════════╗
   ║     Issue #123 Completed! 🎉               ║
   ╠════════════════════════════════════════════╣
   ║  Capture learnings to repository knowledge?║
   ║                                            ║
   ║  Files modified:                           ║
   ║  - pkg/webhooks/processor.go               ║
   ║  - pkg/webhooks/validator.go               ║
   ║                                            ║
   ║  [y] Add to CLAUDE.md  [n] Skip            ║
   └════════════════════════════════════════════┘
   ```

4. If yes: Opens editor with template
5. User adds: "Webhook issues often need both processor and validator"
6. Saved to `.bigocto/CLAUDE.md`
7. Future webhook issues automatically reference this pattern

**Benefit:** Institutional knowledge builds over time

---

## Non-Functional Requirements

### Performance
- App launch: < 500ms
- Menu transitions: instant
- Issue list load: < 2s (cached), < 5s (fresh)
- Command execution: immediate feedback
- Loop iteration: 2-10 minutes depending on task complexity

### Reliability
- Graceful gh CLI error handling
- Clear error messages (match BIGMUX style)
- Offline mode with cached data
- Auto-retry with exponential backoff
- Loop crash recovery (resume from last iteration)

### Usability
- Zero learning curve for BIGMUX users
- Consistent menu patterns across all views
- Always show what command will execute
- Help available on every screen ('?')
- Progress indicators for long operations

### Security
- Use gh CLI's authentication (no token storage)
- Respect GitHub permissions
- No credentials in logs or history
- Secure local database for session data
- Sandbox mode optional for untrusted repos

### Scalability
- Support repos with 1000+ open issues
- Efficient caching to minimize API calls
- Pagination for large result sets
- Background refresh without blocking UI
- Loop mode can run for days unattended

---

## Installation & Distribution

### Installation

```bash
npm install -g @bigdealio/bigocto
```

**Requirements:**
- Node.js >= 18
- gh CLI >= 2.0 (authenticated)
- git >= 2.30
- Claude API key (for Agent SDK)

### First Run Setup

```
Welcome to BIGOCTO!

Let's configure your repositories.

Enter a repository (owner/repo): bigdealio/mzconnect
✓ Added bigdealio/mzconnect

Add another? (Y/n): n

Configure Claude API key? (Y/n): y
Enter ANTHROPIC_API_KEY: sk-ant-***
✓ API key saved

✓ Configuration saved to ~/.config/bigocto/config.toml

Launch BIGOCTO? (Y/n): Y
```

---

## Testing Strategy

### Unit Tests (Vitest)
- Core GitHub operations
- Command generation logic
- Session tracking
- Cache management
- Loop iteration logic
- Quality gate execution

### Integration Tests
- gh CLI integration (mock gh commands)
- Claude Agent SDK integration (mock API calls)
- Command preview → execution flow
- Configuration loading/saving
- Loop full cycle with mocked agent

### Manual Testing
- Full workflow testing in real repos
- Cross-platform compatibility (macOS, Linux, WSL)
- Terminal compatibility (various emulators)
- Overnight loop runs
- Error recovery scenarios

---

## Documentation

### README.md
- Installation instructions
- Quick start guide
- Feature overview
- Keybindings reference
- Configuration examples
- Troubleshooting
- Loop mode guide

### In-App Help
- Context-sensitive help ('?' on any screen)
- Command preview explanations
- First-time user tooltips
- Loop mode warnings and tips

### Video Demos
- **2-minute Interactive TUI**: Browse issues, send to Claude Agent
- **5-minute Loop Mode**: Set up and run autonomous agent
- **3-minute Knowledge System**: How CLAUDE.md builds over time

---

## Release Plan

### Alpha (Internal Testing)
- **Week 1-2**: Core menu system, issue browsing
- **Week 3-4**: Command preview, basic actions
- **Week 5-6**: Claude Agent SDK integration
- **Week 7-8**: Loop mode implementation
- **Week 9-10**: Knowledge system, CLAUDE.md
- Testing with personal repos only

### Beta (Limited Release)
- Invite existing BIGMUX users
- 10-15 CLI-focused developers
- Fractional CTO clients
- 2-week feedback cycle
- Focus on loop mode reliability

### v1.0 Launch
- npm publication: `@bigdealio/bigocto`
- GitHub release with binaries
- Blog post on BIGDEALIO site
- Demo videos on YouTube
- Product Hunt launch (if appropriate)

### Post-Launch Roadmap
- **v1.1** (Month 2): Work session tracking, bulk operations
- **v1.2** (Month 4): AI-powered features (auto-labeling, complexity estimation)
- **v1.3** (Month 6): Team collaboration features

---

## Success Criteria

### Launch Blockers (Must Fix)
- ✅ Menu navigation works perfectly
- ✅ Actions execute reliably
- ✅ Claude Agent SDK integration functional
- ✅ Loop mode runs reliably for 20+ iterations
- ✅ Quality gates prevent bad commits
- ✅ Stable on macOS and Linux
- ✅ Help documentation complete

### Launch Requirements
- ✅ Browse/filter issues
- ✅ View issue details
- ✅ Send to Claude Agent
- ✅ Basic issue operations (edit, comment, close)
- ✅ Action history
- ✅ Repository management
- ✅ Autonomous loop mode
- ✅ Knowledge system (CLAUDE.md, patterns.txt)

### Nice to Have
- ⚪ Custom themes
- ⚪ Saved filters
- ⚪ Work session analytics
- ⚪ Multi-agent coordination

---

## Open Questions

1. **Prompt templates:** Where should users store custom templates? In config dir or separate repo?
2. **Multi-repo operations:** Should we support cross-repo bulk operations?
3. **Offline mode:** How much should work without network? Cache everything?
4. **Agent session detection:** How to detect if Claude Agent session is still active?
5. **Loop interruption:** Should users be able to pause/resume long-running loops?
6. **Quality gate configuration:** Should repos define their own quality gates in config?
7. **Worktree cleanup:** Auto-cleanup old worktrees after N days, or keep until manual deletion?
8. **Parallel loops (v1.0):** Should we support manual parallel execution in v1.0, or wait for v2.0 automatic parallel workers?
9. **Parallel loop coordination:** Should BIGOCTO detect other running loops and coordinate/avoid conflicts?
10. **Resource limits:** Should BIGOCTO track total parallel loops and warn if too many are running?
11. **Worktree dependencies:** Should we auto-run `npm install` in worktrees, or assume dependencies are synced?

---

## Competitive Analysis

| Feature | BIGOCTO | gh CLI | GitHub Desktop | Linear CLI | ralph-unpossible |
|---------|---------|--------|----------------|------------|------------------|
| Menu-driven UI | ✅ | ❌ | ✅ (GUI) | ❌ | ❌ |
| Quick actions | ✅ | ❌ | ✅ | ❌ | ❌ |
| Claude Agent integration | ✅ | ❌ | ❌ | ❌ | ✅ (CLI wrapper) |
| Autonomous loops | ✅ | ❌ | ❌ | ❌ | ✅ |
| Knowledge system | ✅ | ❌ | ❌ | ❌ | ✅ (progress.txt) |
| Workflow focus | ✅ | ❌ | ✅ | ❌ | ❌ |
| Terminal-native | ✅ | ✅ | ❌ | ✅ | ✅ |
| GitHub-specific | ✅ | ✅ | ✅ | ❌ | ✅ |
| TypeScript SDK | ✅ | ❌ | ❌ | ❌ | ❌ (bash) |

**Key Differentiator:** BIGOCTO combines ralph-unpossible's autonomous loop pattern with a workflow-focused interactive TUI, using the Claude Agent SDK for programmatic control. Unlike BIGMUX (which teaches tmux commands), BIGOCTO focuses on **getting work done** rather than teaching CLI syntax.

---

## Brand Consistency

**BIGDEALIO Suite Standards:**
- Product name format: BIG[NOUN]
- ASCII art logo in brand style
- TypeScript + Ink for TUI apps
- MIT license
- NPM package under @bigdealio scope
- Consistent keybindings across suite
- Menu-driven, user-friendly UX

**BIGOCTO-Specific:**
- **Focus**: Workflow efficiency, not CLI education
- **Unlike BIGMUX**: No command preview (users know what they want to do)
- **User assumption**: Familiar with GitHub, wants faster workflows
- **Goal**: Get to Claude Agent sessions quickly, run autonomous loops reliably

---

## Appendix

### A. Example Loop Run Output

```
🚀 BIGOCTO Loop Mode Starting
   Repository: bigdealio/mzconnect
   Max Iterations: 20
   Issues to process: 3

📋 Working on Issue #123: Fix webhook timeout

  🔄 Iteration 1/20
     Launching Claude Agent SDK...
     Running quality gates...
     Tests: ✗
     Lint: ✓
     Skipping commit (quality gates failed)

  🔄 Iteration 2/20
     Launching Claude Agent SDK...
     Running quality gates...
     Tests: ✓
     Lint: ✓
     Committed: a7b3c9d
     🛑 Claude signaled completion
  ✅ Iteration 2: COMPLETE

✅ Issue #123 completed in 2 iterations

📋 Working on Issue #124: Add sentiment analysis

  🔄 Iteration 1/20
     Launching Claude Agent SDK...
     ...

🎉 BIGOCTO Loop Mode Complete
   Total issues: 3
   Completed: 2
   Incomplete: 1
   Total iterations: 15
   Total commits: 8
```

### B. References

- **BIGMUX**: https://github.com/bigDeal-io/bigmux
- **ralph-unpossible**: https://github.com/jeffwray/ralph-unpossible
- **Claude Agent SDK**: https://platform.claude.com/docs/en/agent-sdk/overview
- **gh CLI docs**: https://cli.github.com/manual/
- **Ink framework**: https://github.com/vadimdemedes/ink
- **Commander.js**: https://github.com/tj/commander.js

### C. Glossary

- **TUI**: Terminal User Interface
- **Agent SDK**: Claude's TypeScript/Python SDK for building autonomous agents
- **Loop Mode**: Autonomous execution mode with fresh context per iteration
- **Quality Gate**: Automated checks (tests, lint, typecheck) before committing
- **Exit Signal**: Explicit marker from Claude indicating task completion
- **CLAUDE.md**: Repository-specific knowledge file read by Claude Agent SDK
- **progress.txt**: Iteration log accumulating learnings across loop runs

---

**Document Version:** 1.0  
**Aligned with:** BIGMUX v1.0 architecture, Claude Agent SDK latest  
**Next Review:** Post-alpha implementation  
**Contact:** mobilozophy@bigdealio.com

---

*© 2026 BIGDEALIO, LLC - A product of Fractional CTO Solutions*

---

### Worktree Manager Implementation

```typescript
// src/core/worktree.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { mkdirSync, existsSync, rmSync } from 'fs';
import { homedir } from 'os';

const execAsync = promisify(exec);

interface WorktreeSession {
  path: string;
  branch: string;
  repository: Repository;
  cleanup: () => Promise<void>;
}

export class WorktreeManager {
  private defaultBasePath: string;

  constructor() {
    this.defaultBasePath = join(homedir(), '.bigocto', 'worktrees');
    
    // Ensure base directory exists
    if (!existsSync(this.defaultBasePath)) {
      mkdirSync(this.defaultBasePath, { recursive: true });
    }
  }

  /**
   * Create a git worktree for isolated work
   */
  async create(
    repository: Repository,
    branchName: string,
    customPath?: string
  ): Promise<WorktreeSession> {
    
    const basePath = customPath || this.defaultBasePath;
    const repoSlug = repository.fullName.replace('/', '-');
    const worktreePath = join(basePath, `${repoSlug}-${branchName}`);

    // Check if worktree already exists
    if (existsSync(worktreePath)) {
      console.log(`   ⚠️  Worktree already exists, removing old one...`);
      await this.remove(worktreePath);
    }

    console.log(`   📦 Creating worktree at ${worktreePath}...`);

    try {
      // Create worktree with new branch
      await execAsync(
        `git worktree add -b ${branchName} ${worktreePath}`,
        { cwd: repository.localPath }
      );

      console.log(`   ✓ Worktree created successfully`);

      // Return session with cleanup function
      return {
        path: worktreePath,
        branch: branchName,
        repository,
        cleanup: async () => {
          await this.remove(worktreePath, repository.localPath);
        }
      };

    } catch (error) {
      throw new Error(`Failed to create worktree: ${error.message}`);
    }
  }

  /**
   * Remove a worktree
   */
  private async remove(worktreePath: string, repoPath?: string): Promise<void> {
    try {
      // Remove worktree from git
      if (repoPath) {
        await execAsync(`git worktree remove ${worktreePath} --force`, {
          cwd: repoPath
        });
      }

      // Remove directory if it still exists
      if (existsSync(worktreePath)) {
        rmSync(worktreePath, { recursive: true, force: true });
      }

      console.log(`   ✓ Worktree removed`);
    } catch (error) {
      console.warn(`   ⚠️  Warning: Could not fully remove worktree: ${error.message}`);
      // Don't throw - cleanup is best-effort
    }
  }

  /**
   * List all active worktrees
   */
  async list(repoPath: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git worktree list', { cwd: repoPath });
      return stdout.trim().split('\n');
    } catch (error) {
      return [];
    }
  }

  /**
   * Clean up all BIGOCTO worktrees
   */
  async cleanupAll(repoPath: string): Promise<void> {
    const worktrees = await this.list(repoPath);
    
    for (const worktree of worktrees) {
      if (worktree.includes('.bigocto/worktrees/')) {
        const path = worktree.split(' ')[0];
        await this.remove(path, repoPath);
      }
    }
  }
}
```

**Worktree Usage Example:**

```typescript
// In loop manager
const worktreeSession = await this.worktreeManager.create(
  repository,
  'issue-123-fix-webhook',
  '~/.bigocto/worktrees'
);

// Change to worktree
process.chdir(worktreeSession.path);

try {
  // Run loop iterations here
  // All git operations happen in worktree
  
} finally {
  // Always cleanup
  await worktreeSession.cleanup();
  process.chdir(originalDir);
}
```

**Testing Worktrees:**

For development and testing, worktrees can be challenging because:
1. Tests might not run correctly in isolation
2. Dependencies might not be installed
3. Database connections might fail

**Solution: Use `--no-worktree` flag during testing:**

```bash
# Development/testing
bigocto loop 123 --no-worktree --max-iterations 5

# Production use
bigocto loop 123 --max-iterations 50  # Uses worktree by default
```

**Worktree Directory Structure:**

```
~/.bigocto/worktrees/
├── bigdealio-mzconnect-issue-123-fix-webhook/
│   ├── .git                    # Linked to main repo
│   ├── src/                    # Full source code
│   ├── package.json
│   └── .bigocto/
│       └── progress.txt        # Iteration log
├── bigdealio-mzconnect-issue-124-add-ai/
└── bigdealio-bigmux-issue-45-menu-fix/
```

Each worktree is a complete copy of the repository at a specific branch, allowing:
- Parallel development on multiple issues
- No conflicts with main working directory
- Easy cleanup when done
- Isolation of npm/dependency installations


---

### Quality Gate Modes

```typescript
// src/core/quality-gate.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type QualityGateMode = 'full' | 'code-only' | 'off';

interface QualityGateResult {
  tests: { pass: boolean; output: string; skipped: boolean };
  lint: { pass: boolean; output: string; skipped: boolean };
  typecheck: { pass: boolean; output: string; skipped: boolean };
  allPass: boolean;
  mode: QualityGateMode;
}

export class QualityGate {
  private mode: QualityGateMode;

  constructor(mode: QualityGateMode = 'full') {
    this.mode = mode;
  }

  /**
   * Run quality checks based on mode
   */
  async run(): Promise<QualityGateResult> {
    if (this.mode === 'off') {
      return this.createSkippedResult();
    }

    const lint = await this.runLint();
    const typecheck = await this.runTypecheck();
    
    // Only run tests in 'full' mode
    const tests = this.mode === 'full' 
      ? await this.runTests()
      : { pass: true, output: 'Skipped (code-only mode)', skipped: true };

    return {
      tests,
      lint,
      typecheck,
      allPass: lint.pass && typecheck.pass && tests.pass,
      mode: this.mode
    };
  }

  private createSkippedResult(): QualityGateResult {
    return {
      tests: { pass: true, output: 'Skipped', skipped: true },
      lint: { pass: true, output: 'Skipped', skipped: true },
      typecheck: { pass: true, output: 'Skipped', skipped: true },
      allPass: true,
      mode: 'off'
    };
  }

  private async runTests(): Promise<{ pass: boolean; output: string; skipped: boolean }> {
    try {
      const { stdout, stderr } = await execAsync('npm test', { 
        timeout: 300000 // 5 minute timeout
      });
      return { pass: true, output: stdout + stderr, skipped: false };
    } catch (error) {
      return { pass: false, output: error.stdout + error.stderr, skipped: false };
    }
  }

  private async runLint(): Promise<{ pass: boolean; output: string; skipped: boolean }> {
    try {
      const { stdout, stderr } = await execAsync('npm run lint');
      return { pass: true, output: stdout + stderr, skipped: false };
    } catch (error) {
      return { pass: false, output: error.stdout + error.stderr, skipped: false };
    }
  }

  private async runTypecheck(): Promise<{ pass: boolean; output: string; skipped: boolean }> {
    try {
      const { stdout, stderr } = await execAsync('npm run typecheck');
      return { pass: true, output: stdout + stderr, skipped: false };
    } catch (error) {
      return { pass: false, output: error.stdout + error.stderr, skipped: false };
    }
  }
}
```

**Quality Gate Mode Decision Matrix:**

| Scenario | Workspace | Quality Gates | Why |
|----------|-----------|---------------|-----|
| Simple lib, tests are stateless | Worktree | `full` | Tests work anywhere, full automation possible |
| API with test database | Worktree | `code-only` | Tests need specific DB config from main repo |
| Testing BIGOCTO itself | Current folder | `full` | Want to see everything, have all configs |
| Quick debugging loop | Current folder | `full` | Want immediate feedback with tests |
| Overnight batch processing | Worktree | `code-only` | Safe default, you QC tests in morning |
| CI/CD integration | Worktree | `full` | CI has all configs, can run full suite |

**Default Behavior:**

```typescript
// In config
const defaults = {
  worktree: {
    enabled: true,
    qualityGates: 'code-only'  // Safe: commits code, you test later
  },
  currentFolder: {
    qualityGates: 'full'  // You're watching, run everything
  }
};
```

**Example Workflows:**

**Workflow A: Complex Repo (e.g., mzCONNECT with DB)**
```bash
# Launch BIGOCTO
bigocto

# In TUI:
# Main Menu → Autonomous Loop Mode
# - Target: Milestone "Q1 2026"
# - Workspace: Worktree - Code Only ✓
# - Max Iterations: 100
# [Start Loop]

# Loop runs overnight...

# Morning: Checkout and test in main repo
cd ~/projects/mzconnect
git fetch
git checkout issue-123-fix-webhook
npm test  # Uses your local DB config
```

**Workflow B: Simple Library**
```bash
bigocto

# In TUI:
# Main Menu → Autonomous Loop Mode
# - Target: Milestone "Q1 2026"
# - Workspace: Worktree - Full Autonomous ✓
# - Max Iterations: 50
# [Start Loop]

# Wake up to fully tested, committed code
```

**Workflow C: Solo Development/Testing**
```bash
cd ~/projects/my-lib
bigocto

# In TUI:
# Main Menu → Autonomous Loop Mode
# - Target: Single Issue #45
# - Workspace: Current Folder ✓
# - Max Iterations: 10
# [Start Loop]

# Watch it work in real-time in your directory
```


---

### Loop Configuration Screen (TUI)

The autonomous loop mode is configured entirely through the TUI:

```
╔══════════════════════════════════════════════════════════╗
║           BIGOCTO - Autonomous Loop Setup                ║
║  📁 bigdealio/mzconnect                                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  What should BIGOCTO work on?                             ║
║                                                           ║
║  ( ) Single Issue                                         ║
║      Issue Number: [_____]                                ║
║                                                           ║
║  (•) Milestone                                            ║
║      Select: [Q1 2026                            ▼]       ║
║                                                           ║
║  ( ) Labels                                               ║
║      Select: [bug, priority                      ▼]       ║
║                                                           ║
║  ──────────────────────────────────────────────────────   ║
║                                                           ║
║  How should BIGOCTO work?                                 ║
║                                                           ║
║  (•) Worktree - Code Only (Recommended)                   ║
║      ✓ Isolated directory (~/.bigocto/worktrees)          ║
║      ✓ Lint + Typecheck                                   ║
║      ⊘ Skip unit tests                                    ║
║      → You QC tests in main repo tomorrow                 ║
║                                                           ║
║  ( ) Worktree - Full Autonomous                           ║
║      ✓ Isolated directory                                 ║
║      ✓ Lint + Typecheck + Tests                           ║
║      ⚠️  Only works if tests are standalone               ║
║                                                           ║
║  ( ) Current Folder                                       ║
║      ⚠️  Works in this directory                          ║
║      ✓ All quality gates with your local config           ║
║      → Good for testing BIGOCTO itself                    ║
║                                                           ║
║  ──────────────────────────────────────────────────────   ║
║                                                           ║
║  Configuration                                            ║
║                                                           ║
║  Max Iterations: [100]                                    ║
║  Claude Model:   [claude-sonnet-4-5           ▼]          ║
║  Stop on Error:  [No                          ▼]          ║
║                                                           ║
║  ──────────────────────────────────────────────────────   ║
║                                                           ║
║  Estimated Time: ~10-30 hours (depending on complexity)   ║
║  Estimated Cost: ~$50-150 in API calls                    ║
║                                                           ║
║  ⚠️  This will run unattended. Review settings carefully. ║
║                                                           ║
║  [Start Loop]  [Save as Default]  [Cancel]                ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Configuration is saved** to `~/.config/bigocto/last-loop-config.toml` so you can quickly re-run with same settings.

**During Loop Execution:**

```
╔══════════════════════════════════════════════════════════╗
║           BIGOCTO - Loop Running                          ║
║  📁 bigdealio/mzconnect                                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  Processing Milestone: Q1 2026                            ║
║  Mode: Worktree - Code Only                               ║
║                                                           ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║                                                           ║
║  📋 Issue #123: Fix webhook timeout                       ║
║     Status: 🔄 In Progress                                ║
║     Branch: issue-123-fix-webhook-timeout                 ║
║     Iteration: 3/100                                      ║
║                                                           ║
║     Latest:                                               ║
║     • Implemented chunked processing                      ║
║     • Added timeout configuration                         ║
║     • Updated webhook handler                             ║
║                                                           ║
║     Quality Gates:                                        ║
║     ✓ Lint passed                                         ║
║     ✓ Typecheck passed                                    ║
║     ⊘ Tests skipped (code-only mode)                      ║
║                                                           ║
║  ──────────────────────────────────────────────────────   ║
║                                                           ║
║  Progress: 1/12 issues                                    ║
║  Elapsed: 2h 34m                                          ║
║  Est. Remaining: 8-24h                                    ║
║                                                           ║
║  [Pause]  [Stop]  [View Logs]                             ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Key Features:**
- All configuration through TUI menus
- No CLI flags to remember
- Visual feedback during execution
- Can detach and reattach to running loops
- Settings saved for quick re-runs


---

### Parallel Loop Execution with Worktrees

One of the most powerful features of the worktree approach is **running multiple loops simultaneously**:

**Setup: Multiple Terminal Windows**

```
Terminal 1 (~/projects/mzconnect):
$ bigocto
Main Menu → Autonomous Loop Mode
- Target: Single Issue #123
- Workspace: Worktree - Code Only ✓
[Start Loop]
→ Working in: ~/.bigocto/worktrees/mzconnect-issue-123/

Terminal 2 (~/projects/mzconnect):
$ bigocto
Main Menu → Autonomous Loop Mode
- Target: Single Issue #124
- Workspace: Worktree - Code Only ✓
[Start Loop]
→ Working in: ~/.bigocto/worktrees/mzconnect-issue-124/

Terminal 3 (~/projects/mzconnect):
$ bigocto
Main Menu → Autonomous Loop Mode
- Target: Single Issue #125
- Workspace: Worktree - Code Only ✓
[Start Loop]
→ Working in: ~/.bigocto/worktrees/mzconnect-issue-125/

Your Main Directory (~/projects/mzconnect):
$ git status
On branch main
nothing to commit, working tree clean
→ Completely untouched! All work happening in worktrees
```

**Benefits of Parallel Execution:**

1. **Speed:** Process 3 issues in the time it takes to do 1
2. **Resource usage:** Max out your API rate limits efficiently
3. **No conflicts:** Each worktree is completely isolated
4. **Easy monitoring:** One terminal per loop, easy to track
5. **Selective stopping:** Stop one loop without affecting others

**Practical Parallel Strategy:**

```
Morning Strategy:
- Terminal 1: High-priority bug (issue #123)
- Terminal 2: Medium feature (issue #124)  
- Terminal 3: Documentation (issue #125)

Lunch break: Check progress
- Issue #125 (docs) completed → 1h
- Issue #123 (bug) still running → iteration 15/50
- Issue #124 (feature) still running → iteration 8/50

End of day:
- All 3 complete or ready for QC
- Review in main repo tomorrow morning
```

**Resource Considerations:**

| Parallel Loops | API Calls/Hour | Est. Cost/Hour | RAM Usage |
|----------------|----------------|----------------|-----------|
| 1 loop | ~30-50 | ~$2-5 | ~500MB |
| 3 loops | ~90-150 | ~$6-15 | ~1.5GB |
| 5 loops | ~150-250 | ~$10-25 | ~2.5GB |

**Recommended Parallel Limits:**

- **2-3 loops:** Sweet spot for most machines
- **5+ loops:** Only on powerful machines with high API limits
- **Monitor:** Watch your Anthropic API rate limits (1000 req/min default)

**Example: Overnight Batch Processing**

```bash
# Terminal 1: High-priority issues
bigocto
→ Milestone: "P0 Bugs", Worktree Mode, Max: 50

# Terminal 2: Feature requests  
bigocto
→ Milestone: "Q1 Features", Worktree Mode, Max: 50

# Terminal 3: Technical debt
bigocto
→ Labels: "refactor, tech-debt", Worktree Mode, Max: 30

# Use tmux/screen to keep running after logout
tmux new -s bigocto-1
tmux new -s bigocto-2
tmux new -s bigocto-3
```

**Worktree Directory Structure (Parallel):**

```
~/.bigocto/worktrees/
├── mzconnect-issue-123/     ← Terminal 1 working here
│   ├── .git
│   ├── src/
│   └── .bigocto/progress.txt
├── mzconnect-issue-124/     ← Terminal 2 working here
│   ├── .git
│   ├── src/
│   └── .bigocto/progress.txt
└── mzconnect-issue-125/     ← Terminal 3 working here
    ├── .git
    ├── src/
    └── .bigocto/progress.txt

~/projects/mzconnect/        ← Untouched, ready for your work
├── main branch
└── Your active development
```

**Automatic Parallel Processing (Future Feature):**

In a future version, BIGOCTO could automatically spawn parallel workers:

```
╔══════════════════════════════════════════════╗
║  Parallel Processing (Future)                ║
╠══════════════════════════════════════════════╣
║  Target: Milestone "Q1 2026"                 ║
║  12 issues found                             ║
║                                              ║
║  Parallel Workers: [3]                       ║
║  → Will process 3 issues at once             ║
║                                              ║
║  Workspace: Worktree - Code Only             ║
║  Max Iterations per Issue: 50                ║
║                                              ║
║  Est. Time: 4-8 hours (vs 12-24 sequential)  ║
║                                              ║
║  [Start Parallel Loop]                       ║
╚══════════════════════════════════════════════╝
```

**Current Limitation:**

For v1.0, parallel execution requires **manual setup** (multiple terminal windows). Automatic parallel processing is a v2.0 feature.


---

### Parallel Loop Detection & Coordination (v1.0)

To prevent conflicts when running multiple parallel loops, BIGOCTO includes basic coordination:

**Worktree Lock Files:**

When a loop starts in worktree mode, it creates a lock file:

```
~/.bigocto/locks/
├── mzconnect-issue-123.lock
│   {
│     "pid": 12345,
│     "started": "2026-02-13T20:00:00Z",
│     "issue": 123,
│     "worktree": "~/.bigocto/worktrees/mzconnect-issue-123"
│   }
├── mzconnect-issue-124.lock
└── mzconnect-issue-125.lock
```

**Conflict Detection:**

When starting a new loop, BIGOCTO checks:
1. Is this issue already being processed? (check lock files)
2. Are there too many parallel loops running? (check active PIDs)

```
╔══════════════════════════════════════════════╗
║  ⚠️  Parallel Loop Warning                   ║
╠══════════════════════════════════════════════╣
║  Issue #123 is already being processed       ║
║  in another BIGOCTO session (PID 12345)      ║
║                                              ║
║  Started: 2 hours ago                        ║
║  Worktree: ~/.bigocto/worktrees/mzc-123      ║
║                                              ║
║  What would you like to do?                  ║
║                                              ║
║  ( ) Wait for current loop to finish         ║
║  ( ) Choose different issue                  ║
║  (•) Force start anyway (not recommended)    ║
║                                              ║
║  [Continue]  [Cancel]                        ║
╚══════════════════════════════════════════════╝
```

**Resource Monitoring:**

```
╔══════════════════════════════════════════════╗
║  Parallel Loop Status                        ║
╠══════════════════════════════════════════════╣
║  Currently Running: 3 loops                  ║
║                                              ║
║  1. Issue #123 - 2h 15m - Iteration 12/50    ║
║  2. Issue #124 - 1h 30m - Iteration 8/50     ║
║  3. Issue #125 - 45m - Iteration 5/30        ║
║                                              ║
║  API Usage: ~120 req/hour                    ║
║  Est. Cost: ~$8/hour                         ║
║                                              ║
║  ⚠️  Starting another loop (4 total)         ║
║  Your machine/API limits may be stressed     ║
║                                              ║
║  [Start Anyway]  [Cancel]                    ║
╚══════════════════════════════════════════════╝
```

**Implementation:**

```typescript
// src/core/loop-coordinator.ts
export class LoopCoordinator {
  private lockDir = join(homedir(), '.bigocto', 'locks');

  async checkConflicts(issue: number, repo: Repository): Promise<Conflict | null> {
    const lockFile = join(this.lockDir, `${repo.slug}-issue-${issue}.lock`);
    
    if (existsSync(lockFile)) {
      const lock = JSON.parse(readFileSync(lockFile, 'utf-8'));
      
      // Check if process is still running
      if (this.isProcessRunning(lock.pid)) {
        return {
          type: 'duplicate-issue',
          message: `Issue #${issue} already being processed`,
          lock
        };
      } else {
        // Stale lock, clean it up
        unlinkSync(lockFile);
      }
    }
    
    // Check total parallel loops
    const activeLocks = this.getActiveLocks(repo);
    if (activeLocks.length >= 5) {
      return {
        type: 'too-many-loops',
        message: `Already running ${activeLocks.length} loops`,
        locks: activeLocks
      };
    }
    
    return null;
  }

  async createLock(issue: number, repo: Repository, worktreePath: string): Promise<void> {
    const lockFile = join(this.lockDir, `${repo.slug}-issue-${issue}.lock`);
    
    const lock = {
      pid: process.pid,
      started: new Date().toISOString(),
      issue,
      repository: repo.fullName,
      worktree: worktreePath
    };
    
    mkdirSync(this.lockDir, { recursive: true });
    writeFileSync(lockFile, JSON.stringify(lock, null, 2));
  }

  async removeLock(issue: number, repo: Repository): Promise<void> {
    const lockFile = join(this.lockDir, `${repo.slug}-issue-${issue}.lock`);
    if (existsSync(lockFile)) {
      unlinkSync(lockFile);
    }
  }

  private isProcessRunning(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  private getActiveLocks(repo: Repository): Lock[] {
    // Get all lock files for this repo
    // Filter to only active processes
    // Return array of active locks
  }
}
```

This provides basic safety for parallel execution while keeping v1.0 simple!

