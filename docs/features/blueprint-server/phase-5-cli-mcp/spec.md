# Phase 5: CLI & MCP — Implementation Spec

## Current State

Phases 1-4 complete:
- Full API: auth, blueprint CRUD with versioning, tags, projects, search, comments, download tracking
- SPA connected to API
- CLI workspace exists as placeholder (`cli/src/index.ts`)
- Better Auth with Google SSO (but no device flow yet)

---

## FR-5.1: CLI Package Setup

### Tasks

1. **Install CLI dependencies in `cli/`**
   - `commander` (CLI framework)
   - `node-fetch` or use native fetch (Node 22)
   - `chalk` (terminal colors)
   - Dev: `tsx`, `typescript`, `@types/node`

2. **Configure `cli/package.json`**
   ```json
   {
     "name": "@theodo-blueprints/cli",
     "bin": { "theodo-blueprints": "./dist/index.js" },
     "scripts": {
       "dev": "tsx src/index.ts",
       "build": "tsc",
       "start": "tsx src/index.ts"
     }
   }
   ```

3. **Create CLI entry** — `cli/src/index.ts`
   - Set up Commander program with version, description
   - Register all subcommands

### Files

| Action | Path |
|--------|------|
| Modify | `cli/package.json` |
| Modify | `cli/tsconfig.json` |
| Rewrite | `cli/src/index.ts` |

---

## FR-5.2: CLI Authentication

### Tasks

1. **Create config module** — `cli/src/lib/config.ts`
   ```typescript
   export function getConfig(): { server: string; token?: string }
   export function saveToken(token: string): void
   export function clearToken(): void
   // Reads/writes ~/.theodo-blueprints/config.json
   ```

2. **Create API client** — `cli/src/lib/api.ts`
   ```typescript
   export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
   // Adds Authorization header from stored token
   // Handles errors
   ```

3. **Create auth commands** — `cli/src/commands/auth.ts`
   - `login`: Open browser for auth, store token
   - `status`: Show current user info
   - `logout`: Clear stored credentials

   Note: Full OAuth device flow requires server-side endpoints. For MVP, implement a simpler approach:
   - `login` opens the browser to the web app login page
   - After login, user copies a token from the web app settings/CLI page
   - Or: implement a local callback server that receives the OAuth redirect

4. **Create auth core functions** — `cli/src/lib/auth.core.ts`
   ```typescript
   export function getConfigDir(): string
   // Returns ~/.theodo-blueprints/

   export function getConfigPath(): string
   // Returns ~/.theodo-blueprints/config.json
   ```

### Test Cases

- **auth.core.test.ts**: `getConfigDir` returns correct path
- **auth.core.test.ts**: `getConfigPath` returns correct path

---

## FR-5.3: CLI Blueprint Operations

### Tasks

1. **Create push command** — `cli/src/commands/push.ts`
   - Reads file, parses frontmatter
   - Calls `POST /api/blueprints` for new, `PUT /api/blueprints/:id` for existing
   - `--project` flag for project namespace
   - `--dir` flag to push all .md files in directory
   - Output: created/updated, version number

2. **Create pull command** — `cli/src/commands/pull.ts`
   - Calls `GET /api/blueprints/:id` or by slug
   - `-o` flag to save to file (default: stdout)
   - `--version` flag for specific version
   - Increments download count

3. **Create search command** — `cli/src/commands/search.ts`
   - Calls `GET /api/blueprints/search?q=...`
   - Displays results as formatted list

4. **Create list command** — `cli/src/commands/list.ts`
   - Calls `GET /api/blueprints` with filter flags
   - `--stack`, `--layer`, `--tag`, `--project`

5. **Create info command** — `cli/src/commands/info.ts`
   - Calls `GET /api/blueprints/:id`
   - Shows full details

6. **Create frontmatter parser** — `cli/src/lib/frontmatter.core.ts`
   ```typescript
   export function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string }
   ```

### Test Cases

- **frontmatter.core.test.ts**: Parses frontmatter correctly
- **frontmatter.core.test.ts**: Handles missing frontmatter

---

## FR-5.4: MCP Server

### Tasks

1. **Install MCP SDK in `api/`**
   - `@modelcontextprotocol/sdk` as dependency

2. **Create MCP server** — `api/src/mcp/server.ts`
   Define tools:
   - `search_blueprints` — { query, stack?, layer?, tag? } → search results
   - `get_blueprint` — { id_or_slug } → blueprint with content
   - `list_blueprints` — { stack?, layer?, tag?, project?, limit? } → list
   - `list_projects` — {} → project list
   - `publish_blueprint` — { name, description, usage, stack, layer, content, tags?, project? } → created blueprint
   - `update_blueprint` — { id, content?, metadata? } → updated blueprint
   - `download_blueprint` — { id_or_slug, version? } → raw content (increments count)

   Resources:
   - `blueprint://{id}` — Blueprint content
   - `project://{slug}` — Project overview

3. **Create MCP route** — `api/src/routes/mcp.ts`
   - Mount MCP server at `/api/mcp`
   - Handle MCP protocol messages

4. **Wire in app.ts**

---

## FR-5.5: Claude Code Skill

### Tasks

1. **Create skill file** — `.claude/skills/theodo-blueprints/SKILL.md`
   - Document available commands
   - Provide blueprint format documentation
   - Include examples of well-formed blueprints
   - Route commands to MCP tools when available, CLI fallback

### Files

| Action | Path |
|--------|------|
| Create | `.claude/skills/theodo-blueprints/SKILL.md` |

---

## Implementation Order

1. **FR-5.1** — CLI package setup
2. **FR-5.2** — CLI authentication
3. **FR-5.3** — CLI blueprint operations (push, pull, search, list, info)
4. **FR-5.4** — MCP server
5. **FR-5.5** — Claude Code skill
6. Run `pnpm check && pnpm check-types && pnpm test`

---

## Acceptance Criteria Checklist

- [ ] CLI commands: auth login/status/logout, push, pull, search, list, info
- [ ] CLI reads/writes `~/.theodo-blueprints/config.json`
- [ ] Push parses frontmatter, creates/updates blueprints
- [ ] Pull outputs content to stdout or file
- [ ] Search returns semantic results
- [ ] List supports filter flags
- [ ] MCP server at `/api/mcp` with all tools defined
- [ ] MCP tools: search, get, list, publish, update, download, list_projects
- [ ] MCP resources: blueprint://{id}, project://{slug}
- [ ] Claude Code skill at `.claude/skills/theodo-blueprints/SKILL.md`
- [ ] Skill documents commands and blueprint format
- [ ] `pnpm check && pnpm check-types && pnpm test` all green
- [ ] 100% test coverage on `*.core.ts` files
