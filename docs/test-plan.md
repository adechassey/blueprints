# Local Test Plan

## Prerequisites

- Node.js 22+
- pnpm 10.x
- Docker Desktop running

## 1. Environment Setup

```bash
# Clone and install
pnpm install

# Copy env file
cp .env.example .env
# Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BETTER_AUTH_SECRET
# Generate secret: openssl rand -base64 32
```

## 2. Database

```bash
# Start PostgreSQL + pgvector
docker compose up -d

# Apply migrations
pnpm db:migrate

# Seed test data (admin user + sample blueprints)
pnpm db:seed
```

## 3. Static Checks (no server needed)

```bash
# Biome lint + format
pnpm check

# TypeScript compilation
pnpm check-types

# Unit tests (75 tests, 100% coverage on *.core.ts)
pnpm test

# Dead code detection
pnpm knip
```

All four must pass with zero errors. This is also enforced by the lefthook pre-commit hook.

## 4. Dev Server Smoke Test

```bash
# Start all dev servers (API on :3001, webapp on :5173)
pnpm dev
```

### 4a. API Health

| Test | Command | Expected |
|------|---------|----------|
| Health check | `curl http://localhost:3001/api/health` | `{"status":"ok"}` |
| Rate limit headers | `curl -I http://localhost:3001/api/health` | `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers present |
| List blueprints | `curl http://localhost:3001/api/blueprints` | JSON with `items`, `total`, `page`, `limit` |
| List tags | `curl http://localhost:3001/api/tags` | JSON array of tags |
| List projects | `curl http://localhost:3001/api/projects` | JSON array of projects |
| MCP info | `curl http://localhost:3001/api/mcp` | JSON with `tools` array (7 tools) |
| 404 on missing blueprint | `curl http://localhost:3001/api/blueprints/nonexistent` | `{"error":"Blueprint not found"}` with 404 |
| Admin requires auth | `curl http://localhost:3001/api/admin/stats` | 401 Unauthorized |

### 4b. Webapp

| Test | Action | Expected |
|------|--------|----------|
| Homepage loads | Open `http://localhost:5173` | Blueprint list renders, search bar visible |
| Navigation | Click Projects/Tags links | Pages load without errors |
| Markdown rendering | Click a blueprint with markdown content | Headings, code blocks, links render (not raw text) |
| Search | Type a query in search bar | Results appear (requires seeded data + embeddings) |
| Login flow | Click Login, complete Google OAuth | Redirects back, session established |
| Create blueprint | Authenticated: go to /blueprints/new, fill form | Blueprint created, redirects to detail |
| Edit blueprint | Click Edit on owned blueprint | Form pre-filled, update works |
| Comments | On a blueprint detail, post a comment | Comment appears in thread |
| Admin panel | Login as admin email, go to /admin/* | Stats, user list, role management |
| Download tracking | Copy a blueprint | Download count increments (check console for no silent errors) |

### 4c. Auth & Security

| Test | Action | Expected |
|------|--------|----------|
| Unauthenticated create | `curl -X POST http://localhost:3001/api/blueprints` with JSON body | 401 |
| Rate limiting | Send 6 rapid requests to `/api/blueprints/:id/download` | 5th succeeds, 6th returns 429 |
| MCP auth required | `curl -X POST http://localhost:3001/api/mcp -d '{"method":"tools/list"}'` | 401 |
| Admin delete 404 | Authenticated as admin, DELETE `/api/admin/comments/nonexistent-id` | 404 |
| Slug collision | Create two blueprints with same name in same project | Second gets suffixed slug, no DB error |

### 4d. CLI

```bash
# From cli/ directory
pnpm start auth login --token <your-token>
pnpm start auth status         # Shows logged-in user
pnpm start list                # Lists blueprints
pnpm start search "react"      # Semantic search
pnpm start info <slug>         # Blueprint details
pnpm start pull <slug>         # Outputs content to stdout
pnpm start push test.md        # Pushes a blueprint
pnpm start auth logout
```

### 4e. MCP (via curl)

```bash
# Authenticated request (replace TOKEN)
TOKEN="your-session-cookie"

# tools/list
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=$TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# Expected: 7 tools returned

# tools/call - search
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=$TOKEN" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_blueprints","arguments":{"query":"authentication","limit":5}}}'
```

## 5. E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests (starts dev server automatically)
npx playwright test
```

Tests cover: homepage rendering, navigation, search UI.

## 6. Pre-Push Checklist

- [ ] `pnpm check` passes (biome lint + format)
- [ ] `pnpm check-types` passes (all 4 packages)
- [ ] `pnpm test` passes (75 tests, 100% coverage)
- [ ] `pnpm knip` passes (no unused code)
- [ ] E2E tests pass
- [ ] Manual smoke test on key flows
