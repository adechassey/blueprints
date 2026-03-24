# Phase 6: Polish — Implementation Spec

## Current State

Phases 1-5 complete:
- Full API with auth, CRUD, search, comments, download tracking
- CLI with push/pull/search/list/info
- MCP server with 7 tools
- SPA with all pages
- `users.role` field exists with `admin`/`maintainer`/`user` enum
- `requireRole` middleware exists in `api/src/middleware/roles.ts`
- `ADMIN_EMAILS` env var documented in `.env.example`

---

## FR-6.1: Admin Panel

### Tasks

1. **Create admin API routes** — `api/src/routes/admin.ts`
   - `GET /api/admin/stats` — Returns `{ users, blueprints, comments, projects }` counts
   - `GET /api/admin/users` — List all users with blueprint counts
   - `PUT /api/admin/users/:id/role` — Change user role (body: `{ role }`)
     - Cannot change own role (prevent lockout)
   - All routes protected with `requireAuth` + `requireRole('admin')`

2. **Wire admin routes** — `api/src/app.ts`

3. **Create admin pages in webapp**
   - `webapp/src/routes/admin/index.tsx` — Dashboard with stats
   - `webapp/src/routes/admin/users.tsx` — User management
   - `webapp/src/routes/admin/blueprints.tsx` — Blueprint moderation
   - `webapp/src/routes/admin/comments.tsx` — Comment moderation
   - `webapp/src/routes/admin/projects.tsx` — Project management

4. **Create admin hooks** — `webapp/src/hooks/useAdmin.ts`
   ```typescript
   export function useAdminStats()
   export function useAdminUsers()
   export function useChangeRole()
   ```

5. **Add admin nav link** — Update `__root.tsx` to show admin link when user is admin

6. **Add admin i18n messages** — `webapp/messages/en.json`

### Files

| Action | Path |
|--------|------|
| Create | `api/src/routes/admin.ts` |
| Modify | `api/src/app.ts` |
| Create | `webapp/src/routes/admin/index.tsx` |
| Create | `webapp/src/routes/admin/users.tsx` |
| Create | `webapp/src/routes/admin/blueprints.tsx` |
| Create | `webapp/src/routes/admin/comments.tsx` |
| Create | `webapp/src/routes/admin/projects.tsx` |
| Create | `webapp/src/hooks/useAdmin.ts` |
| Modify | `webapp/src/routes/__root.tsx` |
| Modify | `webapp/messages/en.json` |

---

## FR-6.2: Default Admin Seeding

### Tasks

1. **Create admin email checker** — `api/src/lib/admin.core.ts`
   ```typescript
   export function isDefaultAdmin(email: string): boolean
   // Reads ADMIN_EMAILS env var, checks if email matches
   ```

2. **Integrate into Better Auth hook** — Update `api/src/lib/auth.ts`
   - On user creation/signup, check if email is a default admin
   - If yes, set role to `admin`

### Test Cases

- **admin.core.test.ts**: `isDefaultAdmin` returns true for admin emails
- **admin.core.test.ts**: `isDefaultAdmin` returns false for non-admin emails
- **admin.core.test.ts**: `isDefaultAdmin` handles undefined ADMIN_EMAILS

---

## FR-6.3: E2E Test Setup

### Tasks

1. **Install Playwright at root**
   - `@playwright/test` as root devDependency

2. **Create Playwright config** — `playwright.config.ts`
   - Base URL: `http://localhost:5173`
   - Web server: start both Vite and Hono dev servers

3. **Create E2E test files**
   - `e2e/home.spec.ts` — Home page loads, shows blueprint list
   - `e2e/search.spec.ts` — Search bar, submit query, see results
   - `e2e/navigation.spec.ts` — Navigate between pages

   Note: Full auth + CRUD E2E tests require a running DB and auth setup.
   For now, create smoke tests that verify page rendering without auth.
   Add TODO comments for auth-dependent tests.

4. **Add CI config** — `.github/workflows/e2e.yml`
   - Run on PR
   - Set up Node, install deps, build, run E2E tests

### Files

| Action | Path |
|--------|------|
| Create | `playwright.config.ts` |
| Create | `e2e/home.spec.ts` |
| Create | `e2e/search.spec.ts` |
| Create | `e2e/navigation.spec.ts` |
| Create | `.github/workflows/e2e.yml` |

---

## Implementation Order

1. **FR-6.2** — Default admin seeding (core function + auth integration)
2. **FR-6.1** — Admin panel (API routes → frontend pages)
3. **FR-6.3** — E2E test setup
4. Run `pnpm check && pnpm check-types && pnpm test`

---

## Acceptance Criteria Checklist

- [ ] Admin panel at `/admin` (protected, admin-only)
- [ ] User list with search, role dropdown, confirmation dialog
- [ ] Cannot demote self
- [ ] Dashboard with stats (users, blueprints, comments, projects)
- [ ] Quick delete actions for blueprints, comments, projects
- [ ] Default admin emails get admin role on signup
- [ ] `ADMIN_EMAILS` env var support
- [ ] Playwright configured
- [ ] E2E smoke tests for page rendering
- [ ] CI workflow for E2E tests
- [ ] All admin UI strings use Paraglide i18n
- [ ] `pnpm check && pnpm check-types && pnpm test` all green
- [ ] 100% test coverage on `*.core.ts` files
