# Blueprints Server

## Project Overview

A blueprint registry and discovery platform where developers can publish, browse, search, and download code blueprints (annotated code patterns). Company-wide tool — multiple projects publish their blueprints here.

## Tech Stack

- **Runtime**: Node.js 22+
- **Package Manager**: pnpm 10.x
- **Monorepo**: pnpm workspaces + Turbo
- **Frontend**: Vite + React 19 + TanStack Router (SPA)
- **Backend**: Hono (Vercel serverless functions)
- **Database**: Neon PostgreSQL + Drizzle ORM + pgvector
- **Auth**: Better Auth with Google SSO
- **Embeddings**: Transformers.js (all-MiniLM-L6-v2, dedicated serverless function)
- **i18n**: Paraglide JS
- **UI**: shadcn/ui + Tailwind CSS v4
- **Quality**: Biome 2, Knip, Lefthook, Vitest
- **Deployment**: Vercel
- **Local dev DB**: Docker Compose (PostgreSQL + pgvector)

## Monorepo Structure

- `/webapp` — Vite + React SPA
- `/api` — Hono API (Vercel serverless)
- `/cli` — CLI tool for blueprint push/pull (OAuth device flow)
- `/packages/shared` — Shared types, schemas, constants

## Environment

- NEVER read or commit .env files — secrets are already configured by the user
- Use .env.example for documenting required variables

## Commands

- `pnpm dev` — Start all dev servers (via Turbo)
- `pnpm build` — Build all packages (via Turbo)

## Database

- After editing Drizzle schema, always run `drizzle-kit generate` AND apply migrations
- Migrations must be applied before running tests that depend on the DB

## Testing

- 100% test coverage required on pure functions (`*.core.ts` files)
- Pure business logic lives in `.core.ts` files, separated from I/O
- `pnpm test` must pass at all times

## Conventions

- Architectural and technical decisions go in `docs/features/blueprint-server/architecture.md`
- Preferences and project organization go in this file (CLAUDE.md)
- Follow patterns from `keskon-mange-ce-midi` for Drizzle / Auth setup
- Follow patterns from `pr-aquila-ap-v2` for quality tooling (Biome, Knip, etc.)
- Blueprint annotation format follows `pr-aquila-ap-v2/.claude/skills/blueprint/`
- English only in code. i18n for user-facing strings via Paraglide JS.

# Guidelines
Write your learnings in .claude/notes.md as you work on the project. This is a shared knowledge base for the team. Add tips, gotchas, and patterns you discover.