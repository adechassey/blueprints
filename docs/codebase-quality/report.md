# Codebase Quality Report

**Date**: 2026-03-24
**Scope**: Full codebase scan of api/, webapp/, cli/, packages/shared/

---

## 1. Type Safety (Critical)

### 1.1 `as any` — 16 occurrences across webapp and CLI

Every React Query hook result in the webapp is cast to `any` to avoid typing the API response:

```typescript
// This pattern repeats in 12+ components/routes
const { data: blueprint, isLoading } = useBlueprint(id) as any;
```

**Root cause**: The hooks return `unknown` from `apiFetch` and no shared response types exist. The fix is to define typed API response interfaces and use them as generics in the hooks.

**Affected files**: `$blueprintId.tsx`, `edit.tsx`, `projects/index.tsx`, `projects/$slug.tsx`, `tags.tsx`, `users/$userId.tsx`, `admin/users.tsx`, `admin/blueprints.tsx`, `admin/comments.tsx`, `admin/projects.tsx`, `CommentSection.tsx`, `BlueprintList.tsx` (prop `any[]`), `cli/commands/pull.ts`, `cli/commands/info.ts`

### 1.2 `Record<string, unknown>` for form data — 7 occurrences

Blueprint form submissions use `Record<string, unknown>` instead of proper Zod-inferred types:

```typescript
onSubmit: (data: Record<string, unknown>) => void;
```

The API already has `CreateBlueprintInput` / `UpdateBlueprintInput` types — they should be shared and used here.

### 1.3 Empty `packages/shared` — never used

`packages/shared/src/index.ts` exports nothing. Types like `Blueprint`, `Project`, `Tag`, `Comment` are duplicated between webapp hooks, CLI commands, and API services with no single source of truth.

---

## 2. Architecture

### 2.1 Mixed router types — `OpenAPIHono` vs `Hono`

`api/src/app.ts` creates an `OpenAPIHono` instance, but only `health.ts` uses OpenAPI features (`createRoute`, schema definitions). All other 10 route files use plain `Hono`. The OpenAPI setup adds overhead with no benefit since no routes generate API documentation.

### 2.2 MarkdownRenderer doesn't render Markdown

```typescript
// webapp/src/components/MarkdownRenderer.tsx
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
    </div>
  );
}
```

This just wraps content in a `<pre>` tag. It does not parse or render Markdown. A library like `react-markdown` or `marked` is needed.

### 2.3 MCP server has placeholder auth

```typescript
// api/src/mcp/server.ts:92, 117
const authorId = 'mcp-placeholder';
```

The `publish_blueprint` and `update_blueprint` MCP tools use a hardcoded placeholder user ID. Any blueprint created via MCP will fail (FK constraint on `authorId`) or be attributed to a nonexistent user.

### 2.4 MCP HTTP transport not wired

`api/src/routes/mcp.ts` only handles `initialize` and returns "Method not yet implemented" for all other JSON-RPC calls. The MCP tools defined in `api/src/mcp/server.ts` are never reachable via HTTP. The `mcpServer` import was removed from the route file.

---

## 3. Security

### 3.1 No rate limiting (High)

No rate limiting exists on any endpoint. Critical for:
- `POST /api/blueprints/:id/download` — unauthenticated, write operation
- `GET /api/blueprints/search` — triggers embedding generation (expensive)
- `POST /api/auth/*` — login/OAuth endpoints

### 3.2 Download count manipulation (High)

`POST /api/blueprints/:id/download` requires no auth and has no rate limiting. Any client can send unlimited requests to inflate download counts.

### 3.3 Embedding endpoint as DoS vector (Medium)

`POST /api/embeddings` loads a ~90MB ML model and runs inference. Although it requires auth, there's no rate limit. A single authenticated user could trigger many concurrent requests.

---

## 4. Bugs / Logic Errors

### 4.1 Admin delete endpoints don't verify existence

```typescript
// api/src/routes/admin.ts
adminRoutes.delete('/admin/comments/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(comments).where(eq(comments.parentId, id));
  await db.delete(comments).where(eq(comments.id, id));
  return c.json({ success: true }); // Always returns success, even if ID doesn't exist
});
```

Same for `/admin/projects/:id`. Should return 404 if the resource doesn't exist.

### 4.2 Blueprint slug uniqueness not enforced in API

The schema has a composite unique constraint `(projectId, slug)`, but the `createBlueprint` service generates a slug from the name without checking if it already exists in the same project. This will cause a database error on conflict rather than a user-friendly error message.

### 4.3 Silent `.catch(() => {})` on download tracking

```typescript
// webapp/src/routes/blueprints/$blueprintId.tsx:43
apiFetch(`/blueprints/${blueprintId}/download`, { method: 'POST' }).catch(() => {});
```

Download tracking failures are silently swallowed. While intentional (don't block the user), it means you'll never know if tracking is broken.

---

## 5. Code Quality

### 5.1 `console.log`/`console.error` in API production code

The API uses `console.error` for logging embedding failures and `console.log` for server startup. Should use a structured logger (pino) for production observability.

**Locations**: `api/src/index.ts:7`, `api/src/services/blueprints.ts:84,169`, `api/src/services/search.ts:32`

### 5.2 Duplicate API URL constant

`webapp/src/lib/api.ts` and `webapp/src/lib/auth-client.ts` both independently resolve `VITE_API_URL` with the same fallback. Should be a single shared constant.

### 5.3 TODO comments left in production code

| File | Line | TODO |
|------|------|------|
| `api/src/mcp/server.ts` | 92, 117 | Get authenticated user ID from MCP session context |
| `api/src/routes/mcp.ts` | 25 | Integrate full MCP transport |
| `e2e/search.spec.ts` | 12 | Full search E2E test requires running API |
| `e2e/navigation.spec.ts` | 18 | Auth-dependent navigation tests |

---

## 6. Summary by Severity

| Severity | # | Issues |
|----------|---|--------|
| **Critical** | 2 | MCP placeholder auth (will crash on use), MCP tools unreachable via HTTP |
| **High** | 4 | 16x `as any` (no type safety on API responses), no rate limiting, download count manipulation, empty `packages/shared` |
| **Medium** | 5 | MarkdownRenderer doesn't render MD, admin deletes don't check existence, slug collision not handled, duplicate API URL, mixed OpenAPIHono/Hono |
| **Low** | 4 | Console logging in prod, silent download catch, TODO comments, query key naming inconsistency |
