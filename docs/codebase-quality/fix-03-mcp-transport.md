# Fix 03: Wire MCP Transport & Fix Auth

**Severity**: Critical
**Report refs**: 2.3, 2.4

## Problem

1. MCP tools are defined in `api/src/mcp/server.ts` but unreachable via HTTP — `api/src/routes/mcp.ts` only handles `initialize` and returns errors for all other methods
2. `publish_blueprint` and `update_blueprint` tools use `'mcp-placeholder'` as `authorId`, which will fail on FK constraint or attribute content to a nonexistent user

## Solution

### Step 1: Wire the MCP server to the HTTP transport

The `@modelcontextprotocol/sdk` `StreamableHTTPServerTransport` expects Node.js `IncomingMessage`/`ServerResponse`, not the Fetch API `Request`/`Response` that Hono uses. Two approaches:

**Option A (recommended)**: Use the MCP SDK's `SSEServerTransport` or `StreamableHTTPServerTransport` with a Node.js HTTP adapter that wraps the Hono handler:

```typescript
// api/src/routes/mcp.ts
import { createNodeWebSocket } from '@hono/node-ws'; // if using WebSocket transport
// OR implement a manual JSON-RPC dispatcher that calls mcpServer tools directly
```

**Option B (simpler)**: Implement a manual JSON-RPC dispatcher in the route that maps incoming `tools/call` requests to the registered MCP tool handlers:

```typescript
mcpRoute.post('/mcp', async (c) => {
  const body = await c.req.json();

  if (body.method === 'initialize') { /* ... */ }
  if (body.method === 'tools/list') { /* return tool definitions */ }
  if (body.method === 'tools/call') {
    const { name, arguments: args } = body.params;
    const result = await mcpServer.callTool(name, args);
    return c.json({ jsonrpc: '2.0', id: body.id, result });
  }
  if (body.method === 'resources/read') { /* ... */ }
  // ...
});
```

### Step 2: Pass authenticated user context to MCP tools

Replace `'mcp-placeholder'` with actual user context. The MCP protocol supports OAuth — when a client connects, it authenticates first. The server should:

1. Extract the auth token from the MCP request headers
2. Validate it via Better Auth's `getSession`
3. Pass the user ID to tool handlers via a context parameter

```typescript
// api/src/mcp/server.ts
mcpServer.tool('publish_blueprint', ..., async (input, context) => {
  const authorId = context.userId; // from authenticated session
  // ...
});
```

Since `McpServer.tool()` doesn't natively support per-request context, the simplest approach is to validate auth in the HTTP route and pass the user ID when dispatching tool calls:

```typescript
// api/src/routes/mcp.ts
mcpRoute.post('/mcp', requireAuth, async (c) => {
  const user = getUser(c);
  const body = await c.req.json();
  // Pass user.id to tool execution context
});
```

### Step 3: Add tests for MCP JSON-RPC handling

- Test `initialize` returns correct protocol version
- Test `tools/list` returns all 7 tools
- Test `tools/call` with `search_blueprints` returns results
- Test unauthenticated requests return 401

## Files to modify

- `api/src/routes/mcp.ts` — rewrite with full JSON-RPC dispatch
- `api/src/mcp/server.ts` — remove placeholder authorId, accept context parameter

## Files to create

- `api/src/routes/__tests__/mcp.test.ts`

## Acceptance criteria

- [ ] `POST /api/mcp` with `tools/list` returns all 7 tool definitions
- [ ] `POST /api/mcp` with `tools/call` for `search_blueprints` returns results
- [ ] `POST /api/mcp` with `tools/call` for `publish_blueprint` uses real authenticated user
- [ ] No `'mcp-placeholder'` in codebase
- [ ] `pnpm check && pnpm check-types && pnpm test` passes
