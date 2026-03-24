# Phase 6: Polish — PRD

## Goal

Add admin role management UI and E2E test coverage. At the end of this phase, the platform is production-ready with admin controls and confidence from automated testing.

## User Stories

### US-6.1: Admin manages user roles
**As an** admin,
**I want to** promote or demote users (user → maintainer → admin),
**So that** I can delegate moderation responsibilities.

**Acceptance criteria:**
- Admin panel accessible at `/admin`
- User list with search/filter
- Each user shows: name, email, role, join date, blueprint count
- Role change via dropdown (user / maintainer / admin)
- Confirmation dialog before role changes
- Cannot demote yourself (prevent lockout)
- Only visible to users with `admin` role

### US-6.2: Admin moderates content
**As an** admin,
**I want to** see and manage all blueprints, comments, and projects,
**So that** I can remove inappropriate or outdated content.

**Acceptance criteria:**
- Admin dashboard with counts: total users, blueprints, comments, projects
- Quick actions: delete blueprint, delete comment, delete project
- Audit trail: who created/deleted what and when (stretch goal)

### US-6.3: Default admins are seeded on first login
**As a** platform owner,
**I want** designated emails to automatically get admin role on signup,
**So that** the platform has admins from the start without manual intervention.

**Acceptance criteria:**
- `hugo.borsoni@theodo.com` and `antoine.de-chassey@theodo.com` get role `admin` on first login
- Admin email list configured via `ADMIN_EMAILS` env var
- All other signups default to `user`

### US-6.4: E2E tests cover critical paths
**As a** developer,
**I want** E2E tests covering the main user flows,
**So that** regressions are caught before deployment.

**Acceptance criteria:**
- Playwright configured for the project
- Tests cover:
  - Authentication flow (login → redirect → session)
  - Blueprint CRUD (create → view → edit → delete)
  - Search (type query → see results)
  - Comments (add → reply → delete)
- Tests run in CI (GitHub Actions)
- Tests use a test database (not production)

## Functional Requirements

### FR-6.1: Admin panel
- Route: `/admin` (protected, admin-only)
- Sub-pages:
  - `/admin/users` — User management with role changes
  - `/admin/blueprints` — All blueprints with moderation actions
  - `/admin/comments` — Recent comments with delete action
  - `/admin/projects` — Project management
- API endpoints:
  - `GET /api/admin/users` — List all users (admin only)
  - `PUT /api/admin/users/:id/role` — Change user role (admin only)
  - `GET /api/admin/stats` — Dashboard statistics (admin only)
- Admin middleware: check `role === 'admin'` on all `/api/admin/*` routes

### FR-6.2: Default admin seeding
- On signup, check if the user's email matches a default admin list
- Default admins: `hugo.borsoni@theodo.com`, `antoine.de-chassey@theodo.com`
- Admin emails configured via `ADMIN_EMAILS` env var (comma-separated)
- Matching users get role `admin` on first login; all others get `user`

### FR-6.3: E2E test setup
- Playwright configuration in root
- Test database via Docker Compose (separate from dev)
- Auth mocking or test OAuth flow
- Fixtures: seed test data before each test suite
- CI integration: run on PR, block merge on failure

## Non-Functional Requirements

- Admin panel loads in < 1s
- E2E tests complete in < 5 minutes
- All admin UI strings use Paraglide i18n
- Role changes take effect immediately (no cache delay)

## Dependencies

- All previous phases complete (1-5)

## Out of Scope

- Audit log system (track all admin actions)
- User suspension/banning
- Content flagging/reporting
- Email notifications for role changes
- Advanced analytics dashboard

## Deliverables

1. Admin panel with user management
2. Admin moderation pages (blueprints, comments, projects)
3. Admin dashboard with statistics
4. First-user admin seeding logic
5. Playwright E2E test suite covering critical paths
6. CI pipeline for E2E tests
