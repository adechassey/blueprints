# Fix 05: API Robustness (Admin Deletes, Slug Collisions, Consistent Routers)

**Severity**: Medium
**Report refs**: 2.1, 4.1, 4.2

## Problem

1. Admin delete endpoints (`/admin/comments/:id`, `/admin/projects/:id`) return `{ success: true }` even when the resource doesn't exist
2. `createBlueprint` generates a slug from the name but doesn't handle collisions — a duplicate slug in the same project causes an unhandled DB constraint error
3. Mixed `OpenAPIHono` / `Hono` usage across route files — inconsistent architecture

## Solution

### Fix 5a: Admin delete existence checks

**File**: `api/src/routes/admin.ts`

```typescript
// Before
adminRoutes.delete('/admin/comments/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(comments).where(eq(comments.parentId, id));
  await db.delete(comments).where(eq(comments.id, id));
  return c.json({ success: true });
});

// After
adminRoutes.delete('/admin/comments/:id', async (c) => {
  const id = c.req.param('id');
  const [existing] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, id)).limit(1);
  if (!existing) return c.json({ error: 'Comment not found' }, 404);
  await db.delete(comments).where(eq(comments.parentId, id));
  await db.delete(comments).where(eq(comments.id, id));
  return c.json({ success: true });
});
```

Same pattern for `/admin/projects/:id`.

### Fix 5b: Slug collision handling

**File**: `api/src/services/blueprints.ts`

When creating a blueprint, check for slug conflicts and append a suffix:

```typescript
// In createBlueprint, after generating slug:
let slug = generateSlug(input.name);
const existingSlug = await db
  .select({ id: blueprints.id })
  .from(blueprints)
  .where(and(
    eq(blueprints.slug, slug),
    input.projectId ? eq(blueprints.projectId, input.projectId) : isNull(blueprints.projectId)
  ))
  .limit(1);

if (existingSlug.length > 0) {
  slug = `${slug}-${Date.now().toString(36)}`;
}
```

Add a `generateUniqueSlug` pure function to `blueprints.core.ts`:

```typescript
export function appendSlugSuffix(slug: string): string {
  return `${slug}-${Date.now().toString(36)}`;
}
```

### Fix 5c: Standardize on plain Hono

Since only `health.ts` uses OpenAPI features and no OpenAPI docs are generated, simplify:

- Change `health.ts` to use plain `Hono` with a simple handler (remove `createRoute`/`z.object` schema)
- Change `app.ts` to use `new Hono()` instead of `new OpenAPIHono()`
- Remove `@hono/zod-openapi` dependency (keep `@hono/zod-validator` for request validation)

**OR** (alternative): Migrate all routes to `OpenAPIHono` with proper schemas to actually generate API docs. This is more work but adds more value.

**Recommendation**: Standardize on plain `Hono` for now. OpenAPI can be added later when there's a real need for generated API docs.

## Files to modify

- `api/src/routes/admin.ts` — add existence checks to delete endpoints
- `api/src/services/blueprints.ts` — handle slug collisions
- `api/src/services/blueprints.core.ts` — add `appendSlugSuffix`
- `api/src/services/blueprints.core.test.ts` — test `appendSlugSuffix`
- `api/src/app.ts` — change `OpenAPIHono` to `Hono`
- `api/src/routes/health.ts` — simplify to plain Hono
- `api/package.json` — remove `@hono/zod-openapi` (optional)

## Acceptance criteria

- [ ] `DELETE /admin/comments/:nonexistent-id` returns 404
- [ ] `DELETE /admin/projects/:nonexistent-id` returns 404
- [ ] Creating two blueprints with the same name doesn't throw a DB error
- [ ] All route files use consistent router (`Hono` or `OpenAPIHono`, not both)
- [ ] `pnpm check && pnpm check-types && pnpm test` passes
