# Fix 01: Hono RPC Client & Eliminate `as any`

**Severity**: High
**Report refs**: 1.1, 1.2, 1.3

## Problem

- 16 `as any` casts in webapp/CLI because API response shapes are untyped
- 7 `Record<string, unknown>` in form submissions instead of typed payloads
- `packages/shared` exports nothing — types duplicated across packages
- Manual `apiFetch` wrapper has no type inference from the API routes

## Solution: Hono RPC Client

Hono has a built-in typed RPC client (`hono/client`) that infers request/response types directly from the route definitions. This eliminates the need for manually maintained shared types — the client is **automatically typed** from the server code.

### How it works

```typescript
// Server: define a typed route
const app = new Hono()
  .get('/blueprints/:id', async (c) => {
    return c.json({ id: '...', name: '...', stack: 'server' });
  });

// Export the type
export type AppType = typeof app;

// Client: fully typed, zero manual types
import { hc } from 'hono/client';
import type { AppType } from 'api/src/app';

const client = hc<AppType>('http://localhost:3001');
const res = await client.api.blueprints[':id'].$get({ param: { id: '123' } });
const data = await res.json(); // ← fully typed: { id: string, name: string, stack: string }
```

### Step 1: Make all API routes return typed chains

Currently routes are defined as separate `Hono` instances and mounted with `app.route()`. For the RPC client to infer types, routes must be **chained** on the app or use `.route()` return types.

Refactor `api/src/app.ts` to chain route registrations:

```typescript
// api/src/app.ts
import { Hono } from 'hono';

const app = new Hono()
  .route('/api', healthRoute)
  .route('/api', blueprintRoutes)
  .route('/api', tagRoutes)
  // ... etc

export type AppType = typeof app;
export { app };
```

Each route file must also chain its handlers for type inference:

```typescript
// api/src/routes/blueprints.ts
export const blueprintRoutes = new Hono()
  .get('/blueprints', zValidator('query', listBlueprintsSchema), async (c) => { ... })
  .get('/blueprints/:id', async (c) => { ... })
  .post('/blueprints', requireAuth, zValidator('json', createBlueprintSchema), async (c) => { ... })
  // ...
```

### Step 2: Create Hono RPC client in webapp

```typescript
// webapp/src/lib/api.ts
import { hc } from 'hono/client';
import type { AppType } from '../../api/src/app'; // TypeScript path import (type only)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = hc<AppType>(API_URL, {
  fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
});
```

### Step 3: Rewrite hooks to use the typed client

```typescript
// Before
export function useBlueprint(id: string) {
  return useQuery({
    queryKey: ['blueprint', id],
    queryFn: () => apiFetch(`/blueprints/${id}`), // returns unknown
  });
}
// Used as: const { data } = useBlueprint(id) as any;

// After
export function useBlueprint(id: string) {
  return useQuery({
    queryKey: ['blueprint', id],
    queryFn: async () => {
      const res = await api.api.blueprints[':id'].$get({ param: { id } });
      return res.json(); // ← FULLY TYPED from the server route definition
    },
  });
}
// Used as: const { data } = useBlueprint(id); // data is typed, no `as any`
```

### Step 4: Type form submissions with Zod schemas

Move Zod schemas to `packages/shared` so both API and webapp can use them:

```typescript
// packages/shared/src/schemas/blueprint.ts
export const createBlueprintSchema = z.object({ ... });
export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>;
```

With the Hono client, mutations are typed too:

```typescript
export function useCreateBlueprint() {
  return useMutation({
    mutationFn: async (data: CreateBlueprintInput) => {
      const res = await api.api.blueprints.$post({ json: data });
      return res.json();
    },
  });
}
```

### Step 5: Create typed client for CLI

```typescript
// cli/src/lib/api.ts
import { hc } from 'hono/client';
import type { AppType } from '../../api/src/app';
import { getConfig } from './config';

export function createApiClient() {
  const config = getConfig();
  return hc<AppType>(config.server, {
    headers: config.token ? { Authorization: `Bearer ${config.token}` } : {},
  });
}
```

### Step 6: Move shared Zod schemas to `packages/shared`

Even with the Hono client handling response types, input schemas are still needed for client-side form validation:

```
packages/shared/src/
├── index.ts
└── schemas/
    ├── blueprint.ts   # createBlueprintSchema, updateBlueprintSchema, listBlueprintsSchema
    ├── project.ts     # createProjectSchema, updateProjectSchema
    └── index.ts
```

## Files to create

- `packages/shared/src/schemas/blueprint.ts`
- `packages/shared/src/schemas/project.ts`
- `packages/shared/src/schemas/index.ts`
- `packages/shared/src/index.ts` (rewrite)

## Files to modify

- `api/src/app.ts` — chain `.route()` calls, export `AppType`
- `api/src/routes/*.ts` — chain route handlers for type inference
- `api/src/lib/validation.ts` — re-export from shared schemas
- `webapp/src/lib/api.ts` — rewrite to use `hc<AppType>`
- `webapp/src/hooks/*.ts` — rewrite all hooks to use typed client
- `webapp/src/components/BlueprintForm.tsx` — typed onSubmit
- `webapp/src/components/BlueprintList.tsx` — remove `any[]`
- `webapp/src/components/CommentSection.tsx` — remove `as any`
- `webapp/src/routes/**/*.tsx` — remove all `as any` casts
- `cli/src/lib/api.ts` — rewrite to use `hc<AppType>`
- `cli/src/commands/*.ts` — use typed client

## Acceptance criteria

- [ ] Zero `as any` in non-generated source files
- [ ] Zero `Record<string, unknown>` for API payloads
- [ ] Webapp uses `hono/client` with full type inference from API routes
- [ ] CLI uses `hono/client` with full type inference
- [ ] `packages/shared` exports Zod schemas for client-side validation
- [ ] Changing an API route's return type causes compile errors in webapp/CLI
- [ ] `pnpm check && pnpm check-types && pnpm test` passes
- [ ] `pnpm knip` passes
