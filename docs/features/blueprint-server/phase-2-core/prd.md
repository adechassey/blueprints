# Phase 2: Core Features — PRD

## Goal

Implement authentication (Google SSO via Better Auth), blueprint CRUD with versioning, tag and project management, and connect the SPA to the API. At the end of this phase, users can sign in, publish blueprints, browse them, and manage tags/projects.

## User Stories

### US-2.1: User signs in with Google
**As a** user,
**I want to** sign in with my Google account,
**So that** I can publish and manage blueprints.

**Acceptance criteria:**
- "Sign in with Google" button on login page
- Successful OAuth redirects back to the app with an active session
- User record created in DB on first login (role: `user`)
- Session persists across page refreshes
- Sign out clears the session

### US-2.2: User publishes a blueprint
**As an** authenticated user,
**I want to** create a new blueprint with metadata and content,
**So that** others can discover and use my code patterns.

**Acceptance criteria:**
- Form with fields: name, description, usage, stack, layer, tags, project (optional), content (markdown)
- **Drag-and-drop zone**: user can drop a `.md` file onto the form
  - YAML frontmatter is parsed and auto-fills the metadata fields (name, description, usage, stack, layer, tags)
  - Markdown body (after frontmatter) fills the content field
  - User can review and edit auto-filled values before submitting
- Manual form entry also supported (no file required)
- Submitting creates a blueprint + initial version (v1)
- Blueprint appears in the browse list immediately
- Author is set to the current user
- Upload date is recorded

### US-2.3: User updates a blueprint
**As the** author of a blueprint,
**I want to** update its content or metadata,
**So that** I can keep it current.

**Acceptance criteria:**
- Edit form pre-filled with current values
- **Drag-and-drop zone** also available on edit: dropping a new `.md` file re-parses and updates fields
- If content changes, a new version is created (v2, v3, etc.)
- If only metadata changes (name, description, tags), no new version is created
- Optional changelog field when creating a new version
- Previous versions remain accessible

### US-2.4: User browses blueprints
**As a** user,
**I want to** browse all published blueprints with filtering,
**So that** I can find relevant code patterns.

**Acceptance criteria:**
- Paginated list of blueprints with: name, description, stack badge, layer, author, date, tags
- Filters: stack (server/webapp/shared/fullstack), layer, tags, project, author
- Filters reflected in URL (shareable links)
- Empty state when no results match

### US-2.5: User views a blueprint
**As a** user,
**I want to** view a blueprint's full content and version history,
**So that** I can understand and use the code pattern.

**Acceptance criteria:**
- Detail page showing: metadata, full markdown content (rendered), version info
- Version history list with: version number, date, author, changelog
- Ability to view any previous version's content
- Download count displayed

### US-2.6: User manages tags
**As a** user,
**I want to** add tags to my blueprints from existing tags or create new ones,
**So that** blueprints are discoverable.

**Acceptance criteria:**
- Autocomplete input showing existing tags
- Creating a new tag if it doesn't exist
- Tags are lowercase, slugified
- Tag list page showing all tags with blueprint counts

### US-2.7: User creates a project
**As a** user,
**I want to** create a project namespace,
**So that** I can group my team's blueprints together.

**Acceptance criteria:**
- Project creation: name, slug, description
- Project page listing its blueprints
- Blueprints can be published under a project
- Anyone can create a project (loose namespace)

### US-2.8: Author or admin deletes a blueprint
**As the** author of a blueprint (or an admin),
**I want to** delete it,
**So that** outdated patterns are removed.

**Acceptance criteria:**
- Delete button visible only to author and admins
- Confirmation dialog before deletion
- Cascade deletes: versions, tags associations, comments

## Functional Requirements

### FR-2.1: Better Auth integration
- Google OAuth provider configured
- Session management with cookie-based auth
- Auth middleware for Hono routes (protect write endpoints)
- Public endpoints: browse, view, search (read-only)
- Protected endpoints: create, update, delete (require auth)
- User role stored in DB, accessible in session

### FR-2.2: Blueprint API
- `POST /api/blueprints` — Create with initial version
- `GET /api/blueprints` — List with pagination + filters (stack, layer, tags, project, author)
- `GET /api/blueprints/:id` — Get with current version content
- `PUT /api/blueprints/:id` — Update metadata and/or create new version
- `DELETE /api/blueprints/:id` — Soft or hard delete (author/admin only)
- `GET /api/blueprints/:id/versions` — List version history
- `GET /api/blueprints/:id/versions/:version` — Get specific version content

### FR-2.3: Tag API
- `GET /api/tags` — List all tags with blueprint counts
- Tags created inline when publishing/updating blueprints (no separate create endpoint needed)

### FR-2.4: Project API
- `POST /api/projects` — Create project
- `GET /api/projects` — List all projects
- `GET /api/projects/:slug` — Get project detail + blueprints
- `PUT /api/projects/:id` — Update (creator/admin only)

### FR-2.5: SPA integration
- Replace static blueprint file loading with API calls
- TanStack Query for data fetching + caching
- Login/logout UI flow
- Blueprint creation/editing forms
- Filter UI connected to API query params
- Protected routes redirect to login

## Non-Functional Requirements

- API responses < 200ms for list/detail endpoints
- Pagination: default 20 items per page, max 100
- All form inputs validated client-side (Zod) and server-side
- All user-facing strings use Paraglide i18n

## Dependencies

- Phase 1 complete (monorepo, schema, API scaffold, quality tooling)

## Out of Scope

- Semantic search (Phase 3)
- Comments (Phase 4)
- CLI / MCP (Phase 5)
- Admin role management UI (Phase 6)

## Deliverables

1. Better Auth configured with Google SSO
2. Blueprint CRUD API with versioning
3. Tag and project management API
4. SPA connected to API with TanStack Query
5. Login/logout flow in the SPA
6. Blueprint browse, view, create, edit pages
7. Filter UI with URL state
8. Protected route middleware
