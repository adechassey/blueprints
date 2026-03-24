# Phase 2: Core Features — Implementation Spec

## Current State

Phase 1 complete:
- Monorepo: api/, cli/, packages/shared/, webapp/
- Hono API with health check at `/api/health`
- Drizzle schema with all 7 tables + pgvector
- Quality tooling: Biome, Knip, Lefthook, Vitest
- Paraglide JS i18n in webapp
- Docker Compose for local PostgreSQL

---

## FR-2.1: Better Auth Integration

### Tasks

1. **Install Better Auth in `api/`**
   - `better-auth` as dependency
   - `@better-auth/drizzle` for Drizzle adapter (if available, otherwise use standard adapter)

2. **Create Better Auth config** — `api/src/lib/auth.ts`
   ```typescript
   import { betterAuth } from 'better-auth'
   import { drizzleAdapter } from 'better-auth/adapters/drizzle'
   import { db } from '../db/index.js'

   export const auth = betterAuth({
     database: drizzleAdapter(db, { provider: 'pg' }),
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       },
     },
     session: {
       cookieCache: { enabled: true, maxAge: 60 * 5 },
     },
   })
   ```

3. **Create auth routes** — `api/src/routes/auth.ts`
   - Mount Better Auth handler at `/api/auth/*`
   - Better Auth handles all OAuth flows internally

4. **Create auth middleware** — `api/src/middleware/auth.ts`
   ```typescript
   export const requireAuth: MiddlewareHandler
   // Validates session from cookie/header
   // Sets c.set('user', user) and c.set('session', session)
   // Returns 401 if not authenticated
   ```

5. **Create role middleware** — `api/src/middleware/roles.ts`
   ```typescript
   export function requireRole(...roles: string[]): MiddlewareHandler
   // Checks c.get('user').role against allowed roles
   // Returns 403 if not authorized
   ```

6. **Update Drizzle schema for Better Auth tables**
   Better Auth needs its own tables (session, account, verification). Either:
   - Let Better Auth auto-create them via its adapter
   - Or add them to the Drizzle schema explicitly
   Use the approach that Better Auth recommends for Drizzle.

7. **Install Better Auth client in `webapp/`**
   - `better-auth/client` (comes with `better-auth` package or `@better-auth/react`)

8. **Create auth client** — `webapp/src/lib/auth-client.ts`
   ```typescript
   import { createAuthClient } from 'better-auth/react'

   export const authClient = createAuthClient({
     baseURL: import.meta.env.VITE_API_URL,
   })
   ```

9. **Add auth scripts to api/package.json if needed**

### Key Exports

| Module | Export | Type |
|--------|--------|------|
| `api/src/lib/auth.ts` | `auth` | Better Auth instance |
| `api/src/middleware/auth.ts` | `requireAuth` | Hono middleware |
| `api/src/middleware/roles.ts` | `requireRole` | Hono middleware factory |
| `webapp/src/lib/auth-client.ts` | `authClient` | Better Auth client |

### Test Cases

- **auth.test.ts**: Auth middleware returns 401 when no session
- **auth.test.ts**: Auth middleware passes when valid session
- **roles.test.ts**: requireRole('admin') returns 403 for regular users

---

## FR-2.2: Blueprint API

### Tasks

1. **Create Zod validation schemas** — `api/src/lib/validation.ts`
   ```typescript
   export const createBlueprintSchema = z.object({
     name: z.string().min(1).max(200),
     description: z.string().optional(),
     usage: z.string().optional(),
     stack: z.enum(['server', 'webapp', 'shared', 'fullstack']),
     layer: z.string().min(1),
     projectId: z.string().uuid().optional(),
     tags: z.array(z.string()).optional(),
     content: z.string().min(1),
     isPublic: z.boolean().optional().default(true),
   })

   export const updateBlueprintSchema = z.object({
     name: z.string().min(1).max(200).optional(),
     description: z.string().optional(),
     usage: z.string().optional(),
     stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
     layer: z.string().min(1).optional(),
     projectId: z.string().uuid().nullable().optional(),
     tags: z.array(z.string()).optional(),
     content: z.string().min(1).optional(),
     changelog: z.string().optional(),
     isPublic: z.boolean().optional(),
   })

   export const listBlueprintsSchema = z.object({
     page: z.coerce.number().int().positive().default(1),
     limit: z.coerce.number().int().min(1).max(100).default(20),
     stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
     layer: z.string().optional(),
     tag: z.string().optional(),
     projectId: z.string().uuid().optional(),
     authorId: z.string().uuid().optional(),
   })
   ```

2. **Create blueprint service** — `api/src/services/blueprints.ts`
   Pure functions that handle blueprint business logic:
   ```typescript
   export function generateSlug(name: string): string
   // Kebab-case, lowercase, trimmed, max 100 chars

   export async function createBlueprint(db, input, authorId): Promise<Blueprint>
   // Creates blueprint + version v1 + tag associations
   // Sets currentVersionId to v1

   export async function updateBlueprint(db, id, input, authorId): Promise<Blueprint>
   // If content changed: create new version, update currentVersionId
   // If only metadata: update blueprint record, no new version
   // Handle tag updates (remove old, add new)

   export async function listBlueprints(db, filters): Promise<{ items, total, page, limit }>
   // Paginated list with joins for author, tags, project
   // Filters: stack, layer, tag, projectId, authorId

   export async function getBlueprintById(db, id): Promise<Blueprint | null>
   // Include current version content, author, tags, project

   export async function deleteBlueprintById(db, id): Promise<void>
   // Cascade: delete versions, tag associations (comments in Phase 4)

   export async function listVersions(db, blueprintId): Promise<Version[]>
   // Ordered by version number descending

   export async function getVersion(db, blueprintId, version): Promise<Version | null>
   ```

3. **Create blueprint routes** — `api/src/routes/blueprints.ts`
   All routes use OpenAPI definitions:
   - `POST /api/blueprints` — requireAuth, createBlueprintSchema validation
   - `GET /api/blueprints` — public, listBlueprintsSchema query validation
   - `GET /api/blueprints/:id` — public
   - `PUT /api/blueprints/:id` — requireAuth, author check
   - `DELETE /api/blueprints/:id` — requireAuth, author or admin check
   - `GET /api/blueprints/:id/versions` — public
   - `GET /api/blueprints/:id/versions/:version` — public

4. **Wire routes in app** — `api/src/app.ts`
   ```typescript
   app.route('/api', authRoute)
   app.route('/api', blueprintRoutes)
   app.route('/api', tagRoutes)
   app.route('/api', projectRoutes)
   ```

### Key Exports

| Module | Export | Signature |
|--------|--------|-----------|
| `api/src/services/blueprints.ts` | `generateSlug` | `(name: string) => string` |
| `api/src/services/blueprints.ts` | `createBlueprint` | `(db, input, authorId) => Promise<Blueprint>` |
| `api/src/services/blueprints.ts` | `updateBlueprint` | `(db, id, input, authorId) => Promise<Blueprint>` |
| `api/src/services/blueprints.ts` | `listBlueprints` | `(db, filters) => Promise<PaginatedResult>` |
| `api/src/lib/validation.ts` | `createBlueprintSchema`, `updateBlueprintSchema`, `listBlueprintsSchema` | Zod schemas |

### Test Cases

- **blueprints.core.test.ts**: `generateSlug` converts names to kebab-case correctly
- **blueprints.core.test.ts**: `generateSlug` handles special characters, whitespace, unicode
- **blueprints.test.ts**: `POST /api/blueprints` requires auth (returns 401 without session)
- **blueprints.test.ts**: `GET /api/blueprints` returns paginated list
- **blueprints.test.ts**: `GET /api/blueprints/:id` returns blueprint with current version
- **blueprints.test.ts**: Filters work (stack, layer, tag)
- **validation.core.test.ts**: Validation schemas accept valid input and reject invalid

---

## FR-2.3: Tag API

### Tasks

1. **Create tag routes** — `api/src/routes/tags.ts`
   - `GET /api/tags` — List all tags with blueprint counts (ordered by count desc)

2. **Tag creation is inline** — when creating/updating blueprints, tags are:
   - Looked up by name (case-insensitive)
   - Created if they don't exist (slug auto-generated, name lowercased)
   - Associated with the blueprint via blueprint_tags join table

### Test Cases

- **tags.test.ts**: `GET /api/tags` returns tags with counts
- **tags.test.ts**: Tags are created inline when publishing a blueprint

---

## FR-2.4: Project API

### Tasks

1. **Create project routes** — `api/src/routes/projects.ts`
   - `POST /api/projects` — requireAuth. Create project (name, slug, description)
   - `GET /api/projects` — public. List all projects
   - `GET /api/projects/:slug` — public. Project detail + its blueprints
   - `PUT /api/projects/:id` — requireAuth, creator/admin. Update project

2. **Validation schemas** — add to `api/src/lib/validation.ts`
   ```typescript
   export const createProjectSchema = z.object({
     name: z.string().min(1).max(100),
     slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
     description: z.string().optional(),
   })
   ```

### Test Cases

- **projects.test.ts**: `POST /api/projects` creates a project
- **projects.test.ts**: `GET /api/projects/:slug` returns project with blueprints

---

## FR-2.5: SPA Integration

### Tasks

1. **Install TanStack Query in `webapp/`**
   - `@tanstack/react-query`

2. **Create API client** — `webapp/src/lib/api.ts`
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL

   export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
   // Fetch wrapper with base URL, credentials: 'include', JSON parsing, error handling
   ```

3. **Create query hooks** — `webapp/src/hooks/`
   - `useBlueprints(filters)` — list with pagination
   - `useBlueprint(id)` — single blueprint detail
   - `useBlueprintVersions(id)` — version history
   - `useTags()` — all tags
   - `useProjects()` — all projects
   - `useSession()` — current user session (from Better Auth client)

4. **Create mutation hooks**
   - `useCreateBlueprint()`
   - `useUpdateBlueprint()`
   - `useDeleteBlueprint()`
   - `useCreateProject()`

5. **Create pages/routes**
   - `webapp/src/routes/login.tsx` — Login page with Google sign-in button
   - `webapp/src/routes/blueprints/$blueprintId.tsx` — Blueprint detail page
   - `webapp/src/routes/blueprints/new.tsx` — Create blueprint form (protected)
   - `webapp/src/routes/blueprints/$blueprintId/edit.tsx` — Edit blueprint form (protected)
   - `webapp/src/routes/projects/index.tsx` — Projects list
   - `webapp/src/routes/projects/$slug.tsx` — Project detail with its blueprints
   - `webapp/src/routes/tags.tsx` — Tags list

6. **Create components**
   - `webapp/src/components/BlueprintForm.tsx` — Create/edit form with:
     - All fields (name, description, usage, stack, layer, tags, project, content)
     - Drag-and-drop zone for .md files (parses YAML frontmatter)
     - Tag autocomplete with existing tags
     - Markdown editor for content
   - `webapp/src/components/MarkdownRenderer.tsx` — Render markdown content
   - `webapp/src/components/AuthButton.tsx` — Sign in / sign out button
   - `webapp/src/components/ProtectedRoute.tsx` — Redirect to login if not authenticated
   - `webapp/src/components/Pagination.tsx` — Page navigation
   - `webapp/src/components/FilterBar.tsx` — Stack/layer/tag/project filters
   - `webapp/src/components/DropZone.tsx` — Drag-and-drop file upload with frontmatter parsing

7. **Update root layout** — `webapp/src/routes/__root.tsx`
   - Add QueryClientProvider
   - Add AuthButton to header
   - Add navigation links for projects, tags

8. **Update index route** — `webapp/src/routes/index.tsx`
   - Replace static blueprint loading with API call via `useBlueprints()`
   - Add FilterBar
   - Add pagination
   - URL-synced filters

9. **Add i18n messages for all new UI strings** — `webapp/messages/en.json`
   New keys for: login, logout, create blueprint, edit, delete, form labels, filters, etc.

10. **Handle frontmatter parsing for drag-and-drop** — `webapp/src/lib/frontmatter.core.ts`
    ```typescript
    export function parseBlueprintMarkdown(raw: string): {
      meta: { name?: string; description?: string; usage?: string; stack?: string; layer?: string; tags?: string[] }
      content: string
    }
    ```
    This is a pure function → 100% test coverage required.

### Key Exports

| Module | Export | Type |
|--------|--------|------|
| `webapp/src/lib/api.ts` | `apiFetch` | Async fetch wrapper |
| `webapp/src/lib/auth-client.ts` | `authClient` | Better Auth React client |
| `webapp/src/lib/frontmatter.core.ts` | `parseBlueprintMarkdown` | Pure function |
| `webapp/src/hooks/useBlueprints.ts` | `useBlueprints` | React Query hook |

### Test Cases

- **frontmatter.core.test.ts**: Parses YAML frontmatter correctly (name, description, usage, stack, layer, tags)
- **frontmatter.core.test.ts**: Handles missing frontmatter gracefully
- **frontmatter.core.test.ts**: Handles malformed YAML
- **frontmatter.core.test.ts**: Extracts markdown content after frontmatter
- **frontmatter.core.test.ts**: 100% coverage required (pure function in .core.ts)
- **validation.core.test.ts**: Blueprint creation schema validates correctly
- **validation.core.test.ts**: List blueprints schema defaults and coercion work

---

## Implementation Order

1. **FR-2.1** — Better Auth integration (API-side first, then client)
2. **FR-2.2** — Blueprint API (validation → service → routes → tests)
3. **FR-2.3** — Tag API
4. **FR-2.4** — Project API
5. **FR-2.5** — SPA integration (API client → hooks → pages → components)
6. Run `pnpm check && pnpm check-types && pnpm test` — verify all green

---

## Acceptance Criteria Checklist

- [ ] "Sign in with Google" works end-to-end
- [ ] User record created on first login with role `user`
- [ ] Session persists across page refreshes
- [ ] Sign out clears session
- [ ] `POST /api/blueprints` creates blueprint + version
- [ ] `GET /api/blueprints` returns paginated, filtered list
- [ ] `GET /api/blueprints/:id` returns blueprint with current version
- [ ] `PUT /api/blueprints/:id` creates new version when content changes
- [ ] `PUT /api/blueprints/:id` updates metadata without new version when content unchanged
- [ ] `DELETE /api/blueprints/:id` works for author and admin
- [ ] Version history accessible
- [ ] Tags created inline, listed with counts
- [ ] Projects CRUD works
- [ ] SPA uses API (no more static file loading)
- [ ] Drag-and-drop .md upload with frontmatter parsing
- [ ] Filter UI reflects in URL
- [ ] All new user-facing strings use Paraglide i18n
- [ ] `pnpm check && pnpm check-types && pnpm test` all green
- [ ] 100% test coverage on `*.core.ts` files
