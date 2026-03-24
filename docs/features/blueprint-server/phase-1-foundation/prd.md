# Phase 1: Foundation — PRD

## Goal

Bootstrap the monorepo infrastructure, quality tooling, local dev environment, i18n, database schema, and a minimal Hono API. At the end of this phase, a developer can clone the repo, run `pnpm dev`, and hit a health-check endpoint against a local PostgreSQL with pgvector.

## User Stories

### US-1.1: Developer bootstraps the project
**As a** developer joining the project,
**I want to** run `pnpm install && pnpm dev` and have everything start,
**So that** I can begin contributing immediately.

**Acceptance criteria:**
- `pnpm dev` starts both the Vite SPA and Hono API via Turbo
- SPA is accessible at `http://localhost:5173`
- API is accessible at `http://localhost:3001`
- Health check at `GET /api/health` returns `{ status: "ok" }`

### US-1.2: Developer runs quality checks locally
**As a** developer,
**I want** pre-commit hooks to catch lint, type, and test errors before I push,
**So that** CI stays green and code quality is consistent.

**Acceptance criteria:**
- `pnpm check` runs Biome lint + format check
- `pnpm check-types` runs TypeScript type check across all packages
- `pnpm test` runs Vitest unit tests with coverage enabled
- Coverage: 100% required on all `*.core.ts` files (pure functions)
- `pnpm knip` detects unused code/dependencies
- Lefthook runs all four on pre-commit

### US-1.3: Developer runs a local database
**As a** developer,
**I want** a Docker Compose setup for PostgreSQL with pgvector,
**So that** I can develop offline without a cloud database.

**Acceptance criteria:**
- `docker compose up -d` starts PostgreSQL 17 with pgvector extension
- Database is accessible at `postgresql://blueprints:blueprints@localhost:5432/blueprints`
- Drizzle can connect and run migrations against it

### US-1.4: Database schema is ready
**As a** developer,
**I want** the full Drizzle schema defined and migrations generated,
**So that** Phase 2 can build CRUD operations on top of it.

**Acceptance criteria:**
- All tables from the architecture are defined in Drizzle schema (users, projects, blueprints, blueprint_versions, tags, blueprint_tags, comments)
- pgvector extension is enabled and `embedding vector(384)` column works
- Enums defined: user_role (admin, maintainer, user), stack (server, webapp, shared, fullstack)
- Migrations generated and applicable via `pnpm db:migrate`
- Drizzle Studio accessible via `pnpm db:studio`

### US-1.5: i18n is wired from the start
**As a** developer,
**I want** Paraglide JS configured in the SPA,
**So that** all user-facing strings are translatable from day one.

**Acceptance criteria:**
- Paraglide JS installed and configured in the webapp
- English message file at `webapp/messages/en.json`
- At least the existing UI strings (header, navigation) use Paraglide messages
- Adding a new language only requires adding a new JSON file

## Functional Requirements

### FR-1.1: Monorepo structure
- pnpm workspaces: `webapp/`, `api/`, `packages/shared/`
- Turbo configuration for `dev`, `build`, `check`, `check-types`, `test` tasks
- Shared TypeScript config via `packages/shared/`
- `cli/` package created as placeholder (empty, with package.json)

### FR-1.2: Hono API scaffold
- Entry point exports Vercel serverless handler
- Health check route: `GET /api/health`
- CORS middleware configured for SPA origin
- Error handling middleware with consistent JSON error responses
- Zod-OpenAPI setup for future route documentation

### FR-1.3: Drizzle setup
- `drizzle.config.ts` in `/api`
- Schema file with all tables
- Migration output directory
- Database client module (`db/index.ts`) using `postgres` driver
- Scripts: `db:generate`, `db:migrate`, `db:studio`, `db:push`
- After any schema edit: always run `db:generate` then `db:migrate`

### FR-1.4: Quality tooling
- Biome 2: lint + format config (strict mode, consistent with pr-aquila-ap-v2 style)
- Knip: unused code detection config per workspace
- Lefthook: pre-commit hook running check, check-types, test, knip
- Vitest: configured per workspace with coverage
- 100% test coverage required on pure functions (`*.core.ts` files)
- Pure business logic must live in `.core.ts` files, separated from I/O

### FR-1.5: Docker Compose
- PostgreSQL 17 with pgvector extension
- Persistent volume for data
- `.env.example` documenting all required variables

## Non-Functional Requirements

- Cold start for Hono API locally: < 1s
- All quality checks pass on initial scaffold (zero warnings)
- TypeScript strict mode enabled everywhere

## Dependencies

- None (this is the foundation phase)

## Out of Scope

- Authentication (Phase 2)
- Any CRUD operations (Phase 2)
- Semantic search / embeddings (Phase 3)
- CLI / MCP (Phase 5)

## Deliverables

1. Monorepo with 4 workspaces (webapp, api, cli, packages/shared)
2. Hono API with health check, deployable to Vercel
3. Full Drizzle schema + migrations
4. Docker Compose for local PostgreSQL + pgvector
5. Biome, Knip, Lefthook, Vitest configured
6. Paraglide JS wired in webapp
7. `.env.example` with all required variables
8. Updated `CLAUDE.md` with all new commands
