# Blueprint Server — Architecture

## 1. System Overview

A blueprint registry platform with three access interfaces:
- **Web app** (Vite SPA) — Browse, search, filter, comment on blueprints
- **CLI** (`blueprint` command) — Push/pull blueprints from the terminal
- **MCP server** (remote) — Let AI agents interact with the registry directly

All three interfaces talk to the same **Hono API** deployed as Vercel serverless functions, backed by **Neon PostgreSQL** with **pgvector** for semantic search.

```
┌──────────────┐  ┌──────────┐  ┌──────────────┐
│   Web App    │  │   CLI    │  │  MCP Server  │
│  (Vite SPA)  │  │  (Node)  │  │   (Remote)   │
└──────┬───────┘  └────┬─────┘  └──────┬───────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                ┌──────▼───────┐
                │   Hono API   │
                │  (Vercel)    │
                └──────┬───────┘
                       │
              ┌────────▼────────┐
              │  Neon PostgreSQL │
              │  + pgvector     │
              └─────────────────┘
```

## 2. Tech Stack Decisions

### 2.1 Frontend: Vite + React 19 SPA

**Decision**: Keep the existing Vite SPA instead of migrating to Next.js.

**Why**:
- The app already works as a Vite SPA
- Clear separation of concerns (SPA ↔ API)
- Simpler mental model — no SSR/RSC complexity
- Vercel supports static SPA deployment natively

**Stack**:
- React 19
- TanStack Router (file-based routing, already in place)
- TanStack Query (data fetching + caching)
- shadcn/ui + Tailwind CSS v4 (UI components)
- Paraglide JS (i18n)
- Zod (client-side validation)

### 2.2 Backend: Hono on Vercel Serverless

**Decision**: Use Hono as the API framework, deployed as Vercel serverless functions.

**Why**:
- Lightweight, fast, purpose-built for serverless/edge
- First-class Vercel adapter (`@hono/vercel`)
- Built-in OpenAPI/Swagger generation (`@hono/zod-openapi`)
- Middleware system for auth, validation, error handling
- Works with Better Auth natively

**Structure**:
```
/api
├── src/
│   ├── index.ts              # Hono app entry + Vercel export
│   ├── routes/
│   │   ├── blueprints.ts     # CRUD + search + versions
│   │   ├── comments.ts       # Blueprint comments
│   │   ├── projects.ts       # Project namespaces
│   │   ├── tags.ts           # Tag management
│   │   ├── users.ts          # User profiles
│   │   └── auth.ts           # Better Auth routes
│   ├── middleware/
│   │   ├── auth.ts           # Session validation
│   │   └── roles.ts          # Role-based access control
│   ├── db/
│   │   ├── index.ts          # Drizzle client
│   │   ├── schema.ts         # All table definitions
│   │   └── migrations/       # Drizzle migration files
│   ├── services/
│   │   ├── embeddings.ts     # HF Inference API client
│   │   └── search.ts         # Semantic search logic
│   └── lib/
│       ├── errors.ts         # Error types
│       └── validation.ts     # Shared Zod schemas
├── drizzle.config.ts
└── package.json
```

### 2.3 Database: Neon PostgreSQL + Drizzle ORM

**Decision**: Neon for hosted PostgreSQL, Drizzle as ORM, pgvector for semantic search.

**Why**:
- Neon: Serverless-native PostgreSQL, auto-scaling, branching for dev
- Drizzle: Type-safe, lightweight, great migration tooling
- pgvector: Native vector similarity search in PostgreSQL (no separate vector DB needed)

**Local dev**: Docker Compose with `pgvector/pgvector:pg17` image.

### 2.4 Authentication: Better Auth + Google SSO

**Decision**: Better Auth over Auth.js.

**Why**:
- Framework-agnostic — works natively with Hono (no Next.js glue code)
- Built-in OAuth device flow (needed for CLI authentication)
- Simpler API than Auth.js v5
- Used successfully in pr-aquila-ap-v2
- Extensible — adding GitHub provider later is trivial

**Auth flow (Web)**:
1. User clicks "Sign in with Google"
2. Better Auth redirects to Google OAuth consent
3. Callback creates/updates user record
4. Session cookie set, SPA uses it for API calls

**Auth flow (CLI)**:
1. User runs `theodo-blueprints auth login`
2. CLI initiates OAuth device flow → opens browser
3. User approves in browser
4. CLI receives token, stores in `~/.blueprint/config.json`

**Auth flow (MCP)**:
1. On first connection, MCP client triggers OAuth flow (same as CLI — opens browser)
2. Token stored by the MCP client, refreshed automatically
3. No manual API token management — invisible to the user

### 2.5 User Roles

Three-tier RBAC:

| Role | Permissions |
|------|------------|
| **admin** | Everything. Moderate any content, manage users, manage projects. |
| **maintainer** | Moderate blueprints within their projects, manage tags. |
| **user** | Publish own blueprints, comment, manage own content. |

Default role on signup: `user`. Admins promote users via the web UI or API.

### 2.6 Semantic Search: pgvector + Transformers.js

**Decision**: Use Transformers.js (`@huggingface/transformers`) running locally in a **dedicated Vercel serverless function** to generate embeddings. Store and search with pgvector in Neon.

**Why**:
- Free, no external API dependency
- Single model = consistent embeddings (no tokenizer mismatch risk)
- Dedicated function isolates the cold start (~5-10s) from the rest of the API
- pgvector handles similarity search natively in Neon

**Model**: `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions, ~90MB, good quality)

**Architecture**:
- `/api/embeddings` — Dedicated serverless function (higher memory limit, accepts cold start)
- All other `/api/*` routes — Normal Hono functions (fast, no model loading)

**What gets vectorized**: Full blueprint content (description + usage + code). Single embedding per blueprint version.

**Search flow**:
1. User types search query
2. API calls the dedicated embeddings function → gets query vector
3. pgvector `<=>` cosine distance search on pre-computed blueprint vectors
4. Results ranked by similarity, combined with text filters

**Embedding generation**:
- At blueprint create/update time via the dedicated function
- Search queries also go through the same function for the query vector
- Seed script generates embeddings for initial 85 blueprints

### 2.7 i18n: Paraglide JS

**Decision**: Internationalize from the start using Paraglide JS.

**Why**:
- Company-wide tool, teams may be international
- Paraglide is compile-time (no runtime overhead)
- Already used in both reference projects
- Adding i18n later is painful — easier to start with it

**Languages**: English (default). More added on demand.

### 2.8 Quality Tooling

| Tool | Purpose |
|------|---------|
| **Biome 2** | Linting + formatting (replaces ESLint + Prettier) |
| **Knip** | Dead code / unused dependency detection |
| **Lefthook** | Git pre-commit hooks |
| **Vitest** | Unit + integration tests |
| **Turbo** | Monorepo task runner + caching |

**Pre-commit hooks** (via Lefthook):
1. `pnpm check` — Biome lint + format
2. `pnpm check-types` — TypeScript type check
3. `pnpm test` — Unit tests
4. `pnpm knip` — Dead code detection

## 3. Data Model

### 3.1 Core Entities

```
users
├── id (uuid, PK)
├── email (unique)
├── name
├── image (avatar URL)
├── role (enum: admin, maintainer, user)
├── createdAt
└── updatedAt

projects (loose namespace — no membership model)
├── id (uuid, PK)
├── name (unique)
├── slug (unique)
├── description
├── createdBy (FK → users)
├── createdAt
└── updatedAt

blueprints
├── id (uuid, PK)
├── name
├── slug (unique within project)
├── description (short summary)
├── usage (when/how to use)
├── currentVersionId (FK → blueprint_versions, nullable)
├── projectId (FK → projects, nullable)
├── authorId (FK → users)
├── stack (enum: server, webapp, shared, fullstack)
├── layer (text — controller, service, hook, etc.)
├── isPublic (boolean, default true)
├── downloadCount (integer, default 0)
├── createdAt
└── updatedAt

blueprint_versions
├── id (uuid, PK)
├── blueprintId (FK → blueprints)
├── version (integer, auto-increment per blueprint)
├── content (text — full markdown with code blocks)
├── changelog (text, optional — what changed)
├── authorId (FK → users)
├── embedding (vector(384), nullable — pgvector)
├── createdAt
└── (immutable — no updatedAt)

tags
├── id (uuid, PK)
├── name (unique, lowercase)
├── slug (unique)
└── createdAt

blueprint_tags (join table)
├── blueprintId (FK → blueprints)
└── tagId (FK → tags)
[Composite PK]

comments
├── id (uuid, PK)
├── blueprintId (FK → blueprints)
├── authorId (FK → users)
├── parentId (FK → comments, nullable — for threads)
├── content (text)
├── createdAt
└── updatedAt
```

### 3.2 Auth Tables (managed by Better Auth)

Better Auth creates and manages its own tables:
- `user` (mapped to our `users` via adapter)
- `session`
- `account` (OAuth provider links)
- `verification`

### 3.3 Key Design Decisions

- **UUID primary keys** — consistent with both reference projects
- **Versions are immutable** — editing creates a new version, never mutates
- **Embedding on version, not blueprint** — each version has its own vector since content changes
- **Projects are loose namespaces** — anyone can create a project, no membership model. Like npm scopes.
- **Tags are shared globally** — normalized tag table, many-to-many with blueprints
- **Comments support threading** — `parentId` enables nested replies
- **Slug uniqueness** — blueprint slugs are unique within a project (or globally if no project)

## 4. API Design

### 4.1 REST Endpoints

**Blueprints**:
- `GET /api/blueprints` — List/filter blueprints (pagination, filters, text search)
- `GET /api/blueprints/search` — Semantic vector search
- `GET /api/blueprints/:id` — Get blueprint with current version
- `GET /api/blueprints/:id/versions` — List all versions
- `GET /api/blueprints/:id/versions/:version` — Get specific version
- `POST /api/blueprints` — Create blueprint (with initial version)
- `PUT /api/blueprints/:id` — Update metadata (creates new version if content changed)
- `DELETE /api/blueprints/:id` — Delete blueprint (admin/author only)

**Comments**:
- `GET /api/blueprints/:id/comments` — List comments for a blueprint
- `POST /api/blueprints/:id/comments` — Add comment
- `PUT /api/comments/:id` — Edit own comment
- `DELETE /api/comments/:id` — Delete own comment (admin can delete any)

**Projects**:
- `GET /api/projects` — List projects
- `GET /api/projects/:slug` — Get project with its blueprints
- `POST /api/projects` — Create project
- `PUT /api/projects/:id` — Update project (creator/admin only)

**Tags**:
- `GET /api/tags` — List all tags (with counts)
- `GET /api/tags/:slug/blueprints` — Blueprints by tag

**Users**:
- `GET /api/users/me` — Current user profile
- `GET /api/users/:id` — Public user profile
- `GET /api/users/:id/blueprints` — User's published blueprints

**Auth** (handled by Better Auth):
- `POST /api/auth/*` — Better Auth routes (login, callback, session, device flow)

### 4.2 MCP Server

The API also exposes an MCP endpoint at `/api/mcp` that supports:

**Tools**:
- `search_blueprints` — Semantic + filter search
- `get_blueprint` — Fetch a blueprint by ID or slug
- `list_blueprints` — List with filters (project, stack, layer, tags)
- `publish_blueprint` — Upload a new blueprint
- `update_blueprint` — Update existing blueprint (creates new version)
- `download_blueprint` — Get blueprint content for local use
- `list_projects` — List available projects
**Resources**:
- `blueprint://{id}` — Individual blueprint content
- `project://{slug}` — Project overview + theodo-blueprints list

This allows Claude Code users to add the server as a remote MCP:
```json
{
  "mcpServers": {
    "theodo-blueprints": {
      "type": "http",
      "url": "https://blueprints.example.com/api/mcp"
    }
  }
}
```

The MCP server uses the same OAuth flow as the CLI — on first connection, the user is prompted to authenticate in their browser. No API tokens to manage.

## 5. CLI Design

### 5.1 Commands

```bash
# Authentication
theodo-blueprints auth login          # OAuth device flow → opens browser
theodo-blueprints auth logout         # Clear stored credentials
theodo-blueprints auth status         # Show current user

# Publishing
theodo-blueprints push [file]         # Upload a blueprint markdown file
theodo-blueprints push --dir [dir]    # Upload all .md files in directory
theodo-blueprints push --project foo  # Publish under a project namespace

# Downloading
theodo-blueprints pull [slug]         # Download blueprint to stdout
theodo-blueprints pull [slug] -o .    # Download to file
theodo-blueprints pull --project foo  # Download all blueprints from a project

# Browsing
theodo-blueprints search [query]      # Semantic search
theodo-blueprints list                # List blueprints (with filters)
theodo-blueprints list --stack server # Filter by stack
theodo-blueprints list --tag nestjs   # Filter by tag
theodo-blueprints list --project foo  # Filter by project
theodo-blueprints info [slug]         # Show blueprint details

```

### 5.2 Config

Stored in `~/.theodo-blueprints/config.json`:
```json
{
  "server": "https://blueprints.example.com",
  "token": "...",
  "defaultProject": "aquila-ap"
}
```

## 6. Skill Integration

A Claude Code skill bundled in the repo at `.claude/skills/blueprint/` that provides:

- `/theodo-blueprints push` — Push local blueprint files to the server
- `/theodo-blueprints pull` — Pull blueprints from the server
- `/theodo-blueprints search [query]` — Search the registry
- `/theodo-blueprints list` — Browse with filters

The skill wraps the CLI commands and can also call the API directly. It follows the pattern from `pr-aquila-ap-v2/.claude/skills/blueprint/` but adapted for the remote registry.

## 7. Deployment Architecture

### 7.1 Vercel

- **Web app**: Static SPA build → Vercel CDN
- **API**: Hono app → Vercel serverless functions (`/api/*`)
- **MCP**: Same Hono app, MCP routes under `/api/mcp`

### 7.2 Neon

- **Production**: Neon main branch
- **Preview**: Neon preview branches (per Vercel preview deployment) — stretch goal
- **Extensions**: `pgvector` enabled

### 7.3 Local Development

```yaml
# docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg17
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: blueprints
      POSTGRES_USER: blueprints
      POSTGRES_PASSWORD: blueprints
```

### 7.4 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://blueprints:blueprints@localhost:5432/blueprints"

# Auth (Better Auth)
BETTER_AUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
BETTER_AUTH_URL="https://blueprints.example.com"

# Embeddings — none needed, Transformers.js runs locally

# App
VITE_API_URL="http://localhost:3001"  # API URL for the SPA
```

## 8. Migration Plan (from current state)

### Phase 1: Foundation
1. Set up monorepo structure (api/, cli/, packages/shared/)
2. Add quality tooling (Biome, Knip, Lefthook, Vitest)
3. Set up Docker Compose for local dev
4. Set up i18n (Paraglide JS) — all user-facing strings from day one
5. Create Drizzle schema + migrations
6. Stand up Hono API with health check

### Phase 2: Core Features
1. Better Auth integration (Google SSO)
2. Blueprint CRUD API
3. Versioning system
4. Tag and project management
5. Connect SPA to API (replace static file loading)

### Phase 3: Search & Discovery
1. Transformers.js embedding function (dedicated serverless)
2. pgvector semantic search
3. Frontend search UI with filters
4. Seed 85 existing blueprints + generate embeddings

### Phase 4: Social Features
1. Comments + threading
2. User profiles + published blueprints view
3. Download counts

### Phase 5: CLI & MCP
1. CLI tool with auth + push/pull
2. MCP server endpoints
3. Bundled Claude Code skill
4. Documentation

### Phase 6: Polish
1. Role management UI (admin panel)
2. E2E tests (Playwright — if needed)
