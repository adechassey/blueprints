# Theodo Blueprints

Interact with the Theodo Blueprints registry — a platform for publishing, discovering, and downloading annotated code patterns.

## Setup

### Option 1: MCP Server (Recommended for Claude Code)

Add to your `.mcp.json`:

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

### Option 2: CLI

```bash
# Install (from the repo)
pnpm --filter @theodo-blueprints/cli start

# Authenticate
theodo-blueprints auth login --token <your-token>
```

## Commands

### `/theodo-blueprints search [query]`

Search for blueprints using natural language.

**Via MCP**: Use the `search_blueprints` tool with a natural language query.
**Via CLI**: `theodo-blueprints search "NestJS CRUD controller"`

### `/theodo-blueprints list`

Browse blueprints with optional filters.

**Via MCP**: Use the `list_blueprints` tool with optional stack, layer, tag filters.
**Via CLI**: `theodo-blueprints list --stack server --tag nestjs`

### `/theodo-blueprints pull [slug]`

Download a blueprint's content.

**Via MCP**: Use the `download_blueprint` tool.
**Via CLI**: `theodo-blueprints pull my-blueprint -o ./blueprint.md`

### `/theodo-blueprints push`

Publish a blueprint to the registry.

**Via MCP**: Use the `publish_blueprint` tool with name, stack, layer, content.
**Via CLI**: `theodo-blueprints push ./my-blueprint.md --project my-project`

## Blueprint Format

Blueprints are markdown files with YAML frontmatter:

```markdown
---
name: "Controller Create Endpoint"
description: "NestJS controller method for creating a resource"
usage: "Use when adding a POST endpoint for resource creation"
stack: server
layer: controller
tags: [nestjs, crud, validation]
---

# Controller Create Endpoint

## Context

When you need a POST endpoint that creates a new resource with validation...

## Pattern

\```typescript
@Post()
@UseGuards(AuthGuard)
async create(@Body() dto: CreateResourceDto): Promise<Resource> {
  return this.service.create(dto);
}
\```

## Key Points

- Always use validation DTOs
- Apply auth guards for protected endpoints
- Return the created resource
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Human-readable name |
| `description` | No | Short summary (1-2 sentences) |
| `usage` | No | When and how to use this pattern |
| `stack` | Yes | `server`, `webapp`, `shared`, or `fullstack` |
| `layer` | Yes | Architecture layer (e.g., `controller`, `service`, `hook`, `component`) |
| `tags` | No | Array of lowercase tags for discovery |

### Best Practices

1. **Be specific**: Each blueprint should cover one pattern, not a tutorial
2. **Include context**: Explain when to use this pattern and why
3. **Show real code**: Include complete, working code examples
4. **Document trade-offs**: Note alternatives and when they're better
5. **Keep it concise**: Aim for 50-200 lines including code
