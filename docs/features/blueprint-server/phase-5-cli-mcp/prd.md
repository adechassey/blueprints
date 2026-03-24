# Phase 5: CLI & MCP — PRD

## Goal

Build the `theodo-blueprints` CLI tool and a remote MCP server, both providing full feature parity with the web app. Bundle a Claude Code skill that wraps these capabilities. At the end of this phase, developers and AI agents can interact with the registry from the terminal or from Claude Code.

## User Stories

### US-5.1: Developer authenticates via CLI
**As a** developer,
**I want to** log in to the blueprint registry from my terminal,
**So that** I can push and pull blueprints.

**Acceptance criteria:**
- `theodo-blueprints auth login` opens the browser for Google OAuth (device flow)
- After approval, token is stored in `~/.theodo-blueprints/config.json`
- `theodo-blueprints auth status` shows the current user
- `theodo-blueprints auth logout` clears stored credentials
- Token refreshes automatically when expired

### US-5.2: Developer pushes a blueprint
**As a** developer,
**I want to** push a local markdown blueprint file to the registry,
**So that** my team can discover and use it.

**Acceptance criteria:**
- `theodo-blueprints push [file.md]` uploads the file
- YAML frontmatter parsed for metadata (name, description, usage, stack, layer, tags)
- If blueprint with same slug exists: creates a new version
- If new: creates the blueprint + v1
- `--project [name]` flag to publish under a project namespace
- `--dir [path]` pushes all `.md` files in a directory
- Output shows: created/updated status, version number, URL

### US-5.3: Developer pulls a blueprint
**As a** developer,
**I want to** download a blueprint to use locally,
**So that** I can apply the pattern in my codebase.

**Acceptance criteria:**
- `theodo-blueprints pull [slug]` outputs content to stdout
- `theodo-blueprints pull [slug] -o [path]` saves to a file
- `--project [name]` scopes to a project
- `--version [n]` pulls a specific version (default: latest)
- Download count incremented on pull

### US-5.4: Developer searches and browses via CLI
**As a** developer,
**I want to** search and list blueprints from the terminal,
**So that** I can find patterns without leaving my workflow.

**Acceptance criteria:**
- `theodo-blueprints search [query]` — Semantic search, shows ranked results
- `theodo-blueprints list` — List all blueprints
- Filter flags: `--stack`, `--layer`, `--tag`, `--project`, `--author`
- `theodo-blueprints info [slug]` — Show full blueprint details
- Output formatted for terminal (colors, tables)

### US-5.5: AI agent uses MCP to interact with the registry
**As a** Claude Code user,
**I want to** add the blueprint registry as a remote MCP server,
**So that** my AI agent can search, fetch, and publish blueprints directly.

**Acceptance criteria:**
- Add to `.mcp.json`:
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
- First connection triggers OAuth in the browser (same device flow as CLI)
- Token managed automatically by the MCP client
- All tools available after authentication

### US-5.6: AI agent searches and fetches blueprints via MCP
**As an** AI agent (Claude Code),
**I want to** search for and retrieve blueprints,
**So that** I can apply proven patterns when writing code.

**Acceptance criteria:**
- `search_blueprints` tool: natural language query → ranked results
- `get_blueprint` tool: fetch full content by slug or ID
- `list_blueprints` tool: browse with filters (stack, layer, tags, project)
- `list_projects` tool: list available projects
- `download_blueprint` tool: get raw content for local use (increments download count)

### US-5.7: AI agent publishes blueprints via MCP
**As an** AI agent,
**I want to** publish or update blueprints on the registry,
**So that** new patterns can be shared without leaving the IDE.

**Acceptance criteria:**
- `publish_blueprint` tool: create new blueprint with metadata + content
- `update_blueprint` tool: update existing (creates new version)
- Requires authenticated MCP session

### US-5.8: Developer uses the Claude Code skill
**As a** developer using Claude Code,
**I want** a bundled skill for blueprint operations,
**So that** I can use slash commands like `/theodo-blueprints push`.

**Acceptance criteria:**
- Skill file at `.claude/skills/theodo-blueprints/SKILL.md`
- Commands:
  - `/theodo-blueprints push` — Push blueprint(s) to the server
  - `/theodo-blueprints pull [slug]` — Pull a blueprint
  - `/theodo-blueprints search [query]` — Search the registry
  - `/theodo-blueprints list` — Browse with filters
- Skill detects whether MCP is configured and uses it, otherwise falls back to CLI
- Skill provides guidance on blueprint format and best practices

## Functional Requirements

### FR-5.1: CLI package
- Package: `@theodo-blueprints/cli` in `/cli`
- Built with a CLI framework (e.g., `commander` or `citty`)
- Runnable locally via `pnpm --filter @theodo-blueprints/cli start` or `tsx cli/src/index.ts`
- **Not published to npm yet** — document how to publish (package.json `bin` field, build step, `npm publish` instructions) but do not publish

### FR-5.2: CLI authentication
- OAuth device flow via Better Auth
- `POST /api/auth/device/code` — Request device code
- CLI displays: "Open this URL and enter code: XXXX-XXXX"
- Polls `POST /api/auth/device/token` until approved
- Token stored in `~/.theodo-blueprints/config.json`
- Token refresh on expiry

### FR-5.3: CLI blueprint operations
- Push: read file, parse frontmatter, call `POST /api/blueprints` or `PUT /api/blueprints/:id`
- Pull: call `GET /api/blueprints/:id/versions/:version`, output content
- Search: call `GET /api/blueprints/search?q=...`, format results
- List: call `GET /api/blueprints?...filters`, format as table
- Info: call `GET /api/blueprints/:id`, format full details

### FR-5.4: MCP server
- MCP endpoint at `/api/mcp` in the Hono API
- Implements MCP protocol (tool definitions, resource definitions)
- OAuth flow for authentication (same device flow, triggered by MCP client)
- Tools: `search_blueprints`, `get_blueprint`, `list_blueprints`, `publish_blueprint`, `update_blueprint`, `download_blueprint`, `list_projects`
- Resources: `blueprint://{id}`, `project://{slug}`

### FR-5.5: Claude Code skill
- Skill file at `.claude/skills/theodo-blueprints/SKILL.md`
- Routes commands to MCP tools or CLI
- Includes blueprint format documentation
- Includes examples of well-formed blueprints

## Non-Functional Requirements

- CLI response time: < 2s for list/search (excluding network latency)
- CLI binary size: < 20MB
- MCP tool responses: < 3s
- CLI works offline for `auth status` and config management
- All CLI output strings localizable (stretch goal — English only for v1)

## Dependencies

- Phase 2 complete (auth, blueprint CRUD API)
- Phase 3 complete (semantic search — needed for search commands)
- Phase 4 recommended (comments, profiles, download tracking)

## Out of Scope

- CLI auto-update mechanism
- MCP streaming responses
- Offline CLI caching of blueprints
- GUI-based CLI (TUI)

## Deliverables

1. `theodo-blueprints` CLI package with all commands (local use only, not published to npm)
2. Documentation on how to publish the CLI to npm (future)
3. OAuth device flow implementation (server + CLI + MCP)
4. Remote MCP server with full tool set
5. MCP OAuth integration
6. Claude Code skill with all slash commands
7. CLI and MCP configuration documentation
