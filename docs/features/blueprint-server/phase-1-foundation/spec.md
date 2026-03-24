# Phase 1: Foundation — Implementation Spec

## Current State

- **Root**: `package.json` with turbo, `pnpm-workspace.yaml` (only `webapp`), `turbo.json` (only `dev`/`build` tasks)
- **Webapp**: Vite + React 19 + TanStack Router + Tailwind CSS v4, ESLint config, static blueprint loading from markdown files
- **Missing**: `api/`, `cli/`, `packages/shared/`, quality tooling (Biome, Knip, Lefthook, Vitest), Docker Compose, Drizzle schema, Paraglide JS

---

## FR-1.1: Monorepo Structure

### Tasks

1. **Create `packages/shared/` workspace**
   - `packages/shared/package.json` (name: `@blueprints/shared`, type: module)
   - `packages/shared/tsconfig.json` (strict, ESNext, noEmit)
   - `packages/shared/src/index.ts` — barrel export (empty for now)

2. **Create `api/` workspace**
   - `api/package.json` (name: `api`, type: module, scripts: dev, build, check-types)
   - `api/tsconfig.json` (strict, ESNext, NodeNext module resolution)
   - `api/src/index.ts` — Hono app entry (see FR-1.2)

3. **Create `cli/` workspace placeholder**
   - `cli/package.json` (name: `cli`, type: module, private: true)
   - `cli/tsconfig.json` (strict, minimal)
   - `cli/src/index.ts` — empty placeholder with `// Phase 5` comment

4. **Update `pnpm-workspace.yaml`**
   ```yaml
   packages:
     - webapp
     - api
     - cli
     - packages/*
   ```

5. **Update root `turbo.json`**
   ```json
   {
     "tasks": {
       "dev": { "cache": false, "persistent": true },
       "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
       "check": {},
       "check-types": {},
       "test": {}
     }
   }
   ```

6. **Update root `package.json` scripts**
   ```json
   {
     "scripts": {
       "dev": "turbo dev",
       "build": "turbo build",
       "check": "turbo check",
       "check-types": "turbo check-types",
       "test": "turbo test",
       "knip": "knip"
     }
   }
   ```

### Files Created/Modified

| Action | Path |
|--------|------|
| Create | `packages/shared/package.json` |
| Create | `packages/shared/tsconfig.json` |
| Create | `packages/shared/src/index.ts` |
| Create | `api/package.json` |
| Create | `api/tsconfig.json` |
| Create | `api/src/index.ts` |
| Create | `cli/package.json` |
| Create | `cli/tsconfig.json` |
| Create | `cli/src/index.ts` |
| Modify | `pnpm-workspace.yaml` |
| Modify | `turbo.json` |
| Modify | `package.json` (root) |

---

## FR-1.2: Hono API Scaffold

### Tasks

1. **Install dependencies in `api/`**
   - `hono`, `@hono/node-server`, `@hono/zod-openapi`
   - Dev: `typescript`, `@types/node`, `tsx`

2. **Create Hono app entry** — `api/src/index.ts`
   ```typescript
   import { serve } from '@hono/node-server'
   import { app } from './app'

   const port = Number(process.env.PORT) || 3001
   serve({ fetch: app.fetch, port })
   ```

3. **Create app module** — `api/src/app.ts`
   ```typescript
   import { OpenAPIHono } from '@hono/zod-openapi'
   import { cors } from 'hono/cors'
   import { healthRoute } from './routes/health'
   import { errorHandler } from './middleware/error-handler'

   export const app = new OpenAPIHono()

   // Middleware
   app.use('*', cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
   app.onError(errorHandler)

   // Routes
   app.route('/api', healthRoute)
   ```

4. **Create health route** — `api/src/routes/health.ts`
   ```typescript
   import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

   export const healthRoute = new OpenAPIHono()

   const route = createRoute({
     method: 'get',
     path: '/health',
     responses: {
       200: {
         content: { 'application/json': { schema: z.object({ status: z.string() }) } },
         description: 'Health check',
       },
     },
   })

   healthRoute.openapi(route, (c) => {
     return c.json({ status: 'ok' }, 200)
   })
   ```

5. **Create error handler middleware** — `api/src/middleware/error-handler.ts`
   ```typescript
   import type { ErrorHandler } from 'hono'

   export const errorHandler: ErrorHandler = (err, c) => {
     const status = 'status' in err ? (err.status as number) : 500
     return c.json({ error: err.message || 'Internal Server Error' }, status)
   }
   ```

6. **API `package.json` scripts**
   ```json
   {
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsc",
       "check-types": "tsc --noEmit"
     }
   }
   ```

### Key Exports

| Module | Export | Signature |
|--------|--------|-----------|
| `api/src/app.ts` | `app` | `OpenAPIHono` instance |
| `api/src/routes/health.ts` | `healthRoute` | `OpenAPIHono` instance |
| `api/src/middleware/error-handler.ts` | `errorHandler` | `ErrorHandler` |

### Test Cases

- **health.test.ts**: `GET /api/health` returns `{ status: "ok" }` with 200
- **error-handler.test.ts**: Unknown route returns 404 JSON error
- **error-handler.test.ts**: Thrown errors return correct status + JSON body

---

## FR-1.3: Drizzle Setup

### Tasks

1. **Install dependencies in `api/`**
   - `drizzle-orm`, `postgres` (pg driver)
   - Dev: `drizzle-kit`

2. **Create Drizzle config** — `api/drizzle.config.ts`
   ```typescript
   import { defineConfig } from 'drizzle-kit'

   export default defineConfig({
     schema: './src/db/schema.ts',
     out: './src/db/migrations',
     dialect: 'postgresql',
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   })
   ```

3. **Create database client** — `api/src/db/index.ts`
   ```typescript
   import { drizzle } from 'drizzle-orm/postgres-js'
   import postgres from 'postgres'
   import * as schema from './schema'

   const client = postgres(process.env.DATABASE_URL!)
   export const db = drizzle(client, { schema })
   ```

4. **Create schema** — `api/src/db/schema.ts`

   **Enums:**
   - `userRole`: `admin`, `maintainer`, `user`
   - `blueprintStack`: `server`, `webapp`, `shared`, `fullstack`

   **Tables:**

   | Table | Columns | Notes |
   |-------|---------|-------|
   | `users` | `id` (uuid PK), `email` (unique), `name`, `image`, `role` (userRole, default 'user'), `createdAt`, `updatedAt` | |
   | `projects` | `id` (uuid PK), `name` (unique), `slug` (unique), `description`, `createdBy` (FK→users), `createdAt`, `updatedAt` | |
   | `blueprints` | `id` (uuid PK), `name`, `slug`, `description`, `usage`, `currentVersionId` (FK→blueprint_versions, nullable), `projectId` (FK→projects, nullable), `authorId` (FK→users), `stack` (blueprintStack), `layer` (text), `isPublic` (boolean, default true), `downloadCount` (integer, default 0), `createdAt`, `updatedAt` | slug unique within project |
   | `blueprint_versions` | `id` (uuid PK), `blueprintId` (FK→blueprints), `version` (integer), `content` (text), `changelog` (text, nullable), `authorId` (FK→users), `embedding` (vector(384), nullable), `createdAt` | immutable |
   | `tags` | `id` (uuid PK), `name` (unique, lowercase), `slug` (unique), `createdAt` | |
   | `blueprint_tags` | `blueprintId` (FK→blueprints), `tagId` (FK→tags) | composite PK |
   | `comments` | `id` (uuid PK), `blueprintId` (FK→blueprints), `authorId` (FK→users), `parentId` (FK→comments, nullable), `content` (text), `createdAt`, `updatedAt` | threading via parentId |

   **pgvector**: Use `vector` custom type from `pgvector/drizzle-orm` or define custom column type for `vector(384)`.

5. **Add scripts to `api/package.json`**
   ```json
   {
     "db:generate": "drizzle-kit generate",
     "db:migrate": "drizzle-kit migrate",
     "db:studio": "drizzle-kit studio",
     "db:push": "drizzle-kit push"
   }
   ```

6. **Add root-level db convenience scripts** — `package.json`
   ```json
   {
     "db:generate": "pnpm --filter api db:generate",
     "db:migrate": "pnpm --filter api db:migrate",
     "db:studio": "pnpm --filter api db:studio"
   }
   ```

### Key Exports

| Module | Export | Type |
|--------|--------|------|
| `api/src/db/index.ts` | `db` | Drizzle database instance |
| `api/src/db/schema.ts` | `users`, `projects`, `blueprints`, `blueprintVersions`, `tags`, `blueprintTags`, `comments` | Drizzle table definitions |
| `api/src/db/schema.ts` | `userRole`, `blueprintStack` | Drizzle pgEnum |

### Test Cases

- **schema.test.ts**: Verify all 7 tables are exported and have expected column names
- **schema.test.ts**: Verify enums have expected values

---

## FR-1.4: Quality Tooling

### Tasks

1. **Install Biome 2 at root**
   - `@biomejs/biome` as root devDependency
   - Create `biome.json` at root

2. **Configure Biome** — `biome.json`
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
     "organizeImports": { "enabled": true },
     "linter": {
       "enabled": true,
       "rules": { "recommended": true }
     },
     "formatter": {
       "enabled": true,
       "indentStyle": "tab",
       "lineWidth": 100
     },
     "javascript": {
       "formatter": {
         "quoteStyle": "single",
         "trailingCommas": "all"
       }
     }
   }
   ```
   Note: Exact config to match pr-aquila-ap-v2 style. Adjust if needed.

3. **Remove ESLint from webapp**
   - Delete `webapp/eslint.config.js`
   - Remove ESLint devDependencies from `webapp/package.json`
   - Remove `lint` script from `webapp/package.json`

4. **Add Biome scripts to each workspace**
   - Root: `"check": "biome check ."`, `"check:fix": "biome check --write ."`
   - Each workspace `package.json`: `"check": "biome check ."`, `"check-types": "tsc --noEmit"`

5. **Install Knip at root**
   - `knip` as root devDependency
   - Create `knip.json` at root with workspace configuration

6. **Configure Knip** — `knip.json`
   ```json
   {
     "workspaces": {
       "webapp": {
         "entry": ["src/main.tsx", "src/routes/**/*.tsx"],
         "project": ["src/**/*.{ts,tsx}"]
       },
       "api": {
         "entry": ["src/index.ts"],
         "project": ["src/**/*.ts"]
       },
       "packages/shared": {
         "entry": ["src/index.ts"],
         "project": ["src/**/*.ts"]
       }
     }
   }
   ```

7. **Install Lefthook**
   - `lefthook` as root devDependency
   - Create `lefthook.yml` at root

8. **Configure Lefthook** — `lefthook.yml`
   ```yaml
   pre-commit:
     parallel: true
     commands:
       check:
         run: pnpm check
       check-types:
         run: pnpm check-types
       test:
         run: pnpm test
       knip:
         run: pnpm knip
   ```

9. **Install Vitest per workspace**
   - `vitest`, `@vitest/coverage-v8` as devDependencies in `api/` and `webapp/`
   - Create `vitest.config.ts` in each workspace

10. **Configure Vitest** — `api/vitest.config.ts` and `webapp/vitest.config.ts`
    ```typescript
    import { defineConfig } from 'vitest/config'

    export default defineConfig({
      test: {
        globals: true,
        coverage: {
          provider: 'v8',
          include: ['src/**/*.core.ts'],
          thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
        },
      },
    })
    ```

11. **Add test scripts**
    - `api/package.json`: `"test": "vitest run --coverage"`
    - `webapp/package.json`: `"test": "vitest run --coverage"`

### Files Created/Modified

| Action | Path |
|--------|------|
| Create | `biome.json` |
| Create | `knip.json` |
| Create | `lefthook.yml` |
| Create | `api/vitest.config.ts` |
| Create | `webapp/vitest.config.ts` |
| Delete | `webapp/eslint.config.js` |
| Modify | `webapp/package.json` (remove ESLint deps, add check/check-types/test scripts) |
| Modify | `package.json` (root — add Biome, Knip, Lefthook devDeps, scripts) |

### Test Cases

- `pnpm check` exits 0 (Biome lint + format passes on all files)
- `pnpm check-types` exits 0 (TypeScript strict mode passes everywhere)
- `pnpm test` exits 0 (Vitest runs, no failures)
- `pnpm knip` exits 0 (no unused code/dependencies)

---

## FR-1.5: Docker Compose

### Tasks

1. **Create `docker-compose.yml`** at root
   ```yaml
   services:
     postgres:
       image: pgvector/pgvector:pg17
       ports:
         - "5432:5432"
       environment:
         POSTGRES_DB: blueprints
         POSTGRES_USER: blueprints
         POSTGRES_PASSWORD: blueprints
       volumes:
         - pgdata:/var/lib/postgresql/data

   volumes:
     pgdata:
   ```

2. **Update `.env.example`** if needed (already has DATABASE_URL)

### Files Created

| Action | Path |
|--------|------|
| Create | `docker-compose.yml` |

---

## FR-1.6: i18n — Paraglide JS

### Tasks

1. **Install Paraglide JS in webapp**
   - `@inlang/paraglide-js` as dependency
   - Vite plugin if available, otherwise compile step

2. **Create Paraglide project config** — `webapp/project.inlang/settings.json`
   ```json
   {
     "$schema": "https://inlang.com/schema/project-settings",
     "sourceLanguageTag": "en",
     "languageTags": ["en"],
     "modules": [
       "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
       "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
       "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js"
     ],
     "plugin.inlang.messageFormat": {
       "pathPattern": "./messages/{languageTag}.json"
     }
   }
   ```

3. **Create English messages** — `webapp/messages/en.json`
   ```json
   {
     "app_title": "Blueprints",
     "nav_all": "All",
     "nav_webapp": "Webapp",
     "nav_server": "Server",
     "nav_shared": "Shared",
     "page_all_title": "All Blueprints",
     "blueprint_count": "{count} blueprint | {count} blueprints"
   }
   ```

4. **Integrate Paraglide into Vite build** — update `webapp/vite.config.ts`
   - Add Paraglide Vite plugin (or compile step in `dev`/`build` scripts)

5. **Update components to use Paraglide messages**
   - `webapp/src/routes/__root.tsx` — Replace hardcoded strings with `m.app_title()`, `m.nav_all()`, etc.
   - `webapp/src/routes/index.tsx` — Replace "All Blueprints" with `m.page_all_title()`
   - `webapp/src/components/BlueprintList.tsx` — Replace blueprint count string with `m.blueprint_count()`

### Files Created/Modified

| Action | Path |
|--------|------|
| Create | `webapp/project.inlang/settings.json` |
| Create | `webapp/messages/en.json` |
| Modify | `webapp/vite.config.ts` |
| Modify | `webapp/src/routes/__root.tsx` |
| Modify | `webapp/src/routes/index.tsx` |
| Modify | `webapp/src/components/BlueprintList.tsx` |
| Modify | `webapp/package.json` (add Paraglide dep) |

### Test Cases

- Messages file `webapp/messages/en.json` exists and contains at least `app_title`, `nav_all`, `nav_server`, `nav_webapp`, `nav_shared`
- Components import from Paraglide generated output (grep for `paraglide` import)
- No hardcoded user-facing strings remain in `__root.tsx` nav links

---

## Implementation Order

1. **FR-1.1** — Monorepo structure (workspaces, turbo config)
2. **FR-1.4** — Quality tooling (Biome, Knip, Lefthook, Vitest) — do early so all new code is checked
3. **FR-1.5** — Docker Compose
4. **FR-1.2** — Hono API scaffold (health route, middleware)
5. **FR-1.3** — Drizzle setup (schema, migrations, db client)
6. **FR-1.6** — i18n (Paraglide JS in webapp)
7. Run `pnpm check && pnpm check-types && pnpm test` — verify all green

---

## Acceptance Criteria Checklist

From the PRD user stories:

- [ ] `pnpm dev` starts both Vite SPA and Hono API via Turbo
- [ ] SPA accessible at `http://localhost:5173`
- [ ] API accessible at `http://localhost:3001`
- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] `pnpm check` runs Biome lint + format
- [ ] `pnpm check-types` runs TypeScript check across all packages
- [ ] `pnpm test` runs Vitest with coverage
- [ ] `pnpm knip` detects unused code/dependencies
- [ ] Lefthook pre-commit hook configured
- [ ] `docker compose up -d` starts PostgreSQL 17 with pgvector
- [ ] All 7 tables defined in Drizzle schema
- [ ] pgvector extension + `embedding vector(384)` column
- [ ] Enums: `userRole`, `blueprintStack`
- [ ] Migrations generated via `pnpm db:generate`
- [ ] `pnpm db:studio` works
- [ ] Paraglide JS configured in webapp
- [ ] English messages at `webapp/messages/en.json`
- [ ] UI strings use Paraglide messages
