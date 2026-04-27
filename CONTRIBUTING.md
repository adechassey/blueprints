# Contributing to Blueprints

## Getting Started

```bash
# Clone and install
git clone <repo-url> && cd blueprints
pnpm install

# Start local DB
docker compose up -d

# Apply migrations and seed
pnpm db:migrate && pnpm db:seed

# Start dev servers
pnpm dev
```

Required: Node.js 22+, pnpm 10.x, Docker.

Copy `.env.example` to `.env` and fill in values. Never commit `.env` files.

## Project Structure

```
blueprints/
├── api/          — Hono backend (Vercel serverless)
├── webapp/       — Vite + React SPA
├── cli/          — CLI tool (push/pull/search)
├── packages/
│   └── shared/   — Shared types & schemas
├── e2e/          — Playwright E2E tests
└── docs/         — Architecture & phase docs
```

## Development Workflow

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm check` | Biome lint + format |
| `pnpm check:fix` | Auto-fix lint issues |
| `pnpm check-types` | TypeScript type check |
| `pnpm test` | Run tests with coverage |
| `pnpm knip` | Detect dead/unused code |

### Code Conventions

- **Pure logic in `.core.ts` files** — Business logic separated from I/O, with 100% test coverage required
- **Atomic commits** — Format: `type(scope): description` (e.g., `feat(api): add blueprint search endpoint`)
- **English only in code** — User-facing strings go through Paraglide JS i18n
- **Database changes** — After editing Drizzle schema, always run `drizzle-kit generate` then apply migrations before running tests

### Quality Gates

All of these must pass before merging:

```bash
pnpm check         # Biome lint + format
pnpm check-types   # TypeScript
pnpm test           # Vitest (100% coverage on *.core.ts)
pnpm knip           # No dead code
```

Lefthook runs these automatically on pre-commit.

---

## Contributing with Claude Code (Skills Workflow)

This project is designed for AI-assisted development using Claude Code. The workflow is built around **skills**, **agents**, and a **phase-based implementation loop**.

### Overview

```
┌─────────────────────────────────────────────────┐
│              Claude Code Skills                 │
│                                                 │
│  /theodo-blueprints  ← Interact with registry   │
│       search / list / pull / push               │
│                                                 │
├─────────────────────────────────────────────────┤
│             Ralph Loop (automated)              │
│                                                 │
│  1. Find current phase                          │
│  2. Write spec (if missing)                     │
│  3. Implement spec                              │
│  4. Spawn phase-validator agent                 │
│  5. Fix failures or commit & continue           │
│                                                 │
├─────────────────────────────────────────────────┤
│           Phase Validator Agent                 │
│                                                 │
│  - Verifies acceptance criteria from PRD        │
│  - Runs automated checks (lint, types, tests)   │
│  - Marks phase as VALIDATED or FAILED           │
│  - Read-only — never edits code                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Skill: `/theodo-blueprints`

The main skill for interacting with the blueprint registry. Available commands:

| Command | Description |
|---------|-------------|
| `/theodo-blueprints search [query]` | Semantic search for blueprints |
| `/theodo-blueprints list` | Browse blueprints with filters |
| `/theodo-blueprints pull [slug]` | Download a blueprint |
| `/theodo-blueprints push` | Publish a blueprint to the registry |

Can also be used via the MCP server (add to `.mcp.json`) or the CLI tool directly.

### The Ralph Loop: Phase-Based Implementation

The project is built in 6 phases, each with a PRD (product requirements) and a spec (implementation plan). The Ralph Loop automates progression through these phases.

#### How to start

```
/ralph-loop "<prompt from .claude/ralph-loop-prompt.md>" --max-iterations 100 --completion-promise "ALL_PHASES_VALIDATED"
```

#### Loop iteration cycle

```
┌──────────────┐
│  current-    │    Runs scripts/current-phase.ts
│  phase.ts    │    Returns: phase number, name, paths, hasSpec
└──────┬───────┘
       │
       ▼
  ┌────────────┐     No spec? Write one from the PRD.
  │ Write spec │     Must include: file paths, function signatures,
  │ (if needed)│     test cases, implementation tasks.
  └──────┬─────┘     Then STOP — implementation starts next iteration.
         │
         ▼
  ┌────────────┐     Work through the spec one requirement at a time.
  │ Implement  │     After each requirement:
  │            │       pnpm check && pnpm check-types
  └──────┬─────┘       pnpm test (if tests changed)
         │
         ▼
  ┌────────────┐     Spawns the phase-validator agent.
  │  Validate  │     Agent checks every acceptance criterion
  │            │     and runs all automated checks.
  └──────┬─────┘
         │
    ┌────┴────┐
    │         │
 PASS      FAIL
    │         │
    ▼         ▼
 Commit    Fix issues, then re-validate
 & next
 phase
```

#### Hard rules during the loop

1. **Never run `scripts/validate-phase.ts` yourself** — only the validation agent may run it
2. **Never edit `tracker.json`** — only the validation script writes to it
3. **Never commit until a phase is validated** — no intermediate commits
4. **Never read `.env` files** — use `.env.example` for reference
5. **Always run migrations** after editing Drizzle schema
6. If stuck for 2+ attempts, leave a `TODO:` comment and move on

### Agent: Phase Validator

A read-only agent that verifies phase completion. Defined in `.claude/agents/phase-validator.md`.

**What it checks:**
- Every acceptance criterion from the PRD is individually verified
- File existence, exports, routes, schemas, config, i18n
- 100% test coverage on all `*.core.ts` files
- `pnpm check`, `pnpm check-types`, and `pnpm test` all pass

**Output:** A structured validation report with PASS/FAIL per criterion and a final VALIDATED or FAILED verdict with suggested fixes.

### Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project conventions (read first) |
| `.claude/skills/theodo-blueprints/SKILL.md` | Blueprint skill definition |
| `.claude/ralph-loop-prompt.md` | Full Ralph Loop prompt |
| `.claude/agents/phase-validator.md` | Validator agent instructions |
| `.claude/notes.md` | Shared team learnings (add tips here) |
| `docs/features/blueprint-server/architecture.md` | System architecture |
| `docs/features/blueprint-server/phase-{N}-*/prd.md` | Phase requirements |
| `docs/features/blueprint-server/tracker.json` | Phase progress tracker |
| `scripts/current-phase.ts` | Determines next phase to work on |
| `scripts/validate-phase.ts` | Phase validation (agent-only) |

### Writing Blueprints

Blueprints are markdown files with YAML frontmatter:

```markdown
---
name: "Controller Create Endpoint"
description: "NestJS controller method for creating a resource"
usage: "Use when adding a POST endpoint for resource creation"
stack: server
layer: controller
tags: [nestjs, crud, validation]
---

# Controller Create Endpoint

## Context
When you need a POST endpoint that creates a new resource...

## Pattern
[code example]

## Key Points
- One pattern per blueprint
- Include complete, working code
- Document trade-offs and alternatives
- Aim for 50-200 lines
```

Required frontmatter: `name`, `stack`, `layer`. Optional: `description`, `usage`, `tags`.
