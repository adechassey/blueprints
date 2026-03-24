# Fix 06: Structured Logging, Duplicate Constants, Silent Catches

**Severity**: Low–Medium
**Report refs**: 4.3, 5.1, 5.2, 5.3

## Problem

1. API uses `console.log`/`console.error` instead of a structured logger — no log levels, no JSON output, no correlation IDs
2. `VITE_API_URL` fallback is duplicated in `webapp/src/lib/api.ts` and `webapp/src/lib/auth-client.ts`
3. Download tracking failures are silently swallowed with `.catch(() => {})`
4. TODO comments in production code

## Solution

### Fix 6a: Install and configure pino logger

```bash
pnpm --filter api add pino
```

Create `api/src/lib/logger.ts`:

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
});
```

Replace all `console.log`/`console.error` in API code:

```typescript
// Before
console.error('Failed to generate embedding:', err);

// After
import { logger } from '../lib/logger.js';
logger.error({ err }, 'Failed to generate embedding');
```

**Files to update**:
- `api/src/index.ts` — `logger.info` for startup
- `api/src/services/blueprints.ts` — `logger.error` for embedding failures
- `api/src/services/search.ts` — `logger.error` for query embedding failure

### Fix 6b: Extract shared API URL constant

Create `webapp/src/lib/config.ts`:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Update `webapp/src/lib/api.ts` and `webapp/src/lib/auth-client.ts` to import from it.

### Fix 6c: Add warning logs for silent catches

```typescript
// Before
apiFetch(`/blueprints/${id}/download`, { method: 'POST' }).catch(() => {});

// After
apiFetch(`/blueprints/${id}/download`, { method: 'POST' }).catch((err) => {
  console.warn('Download tracking failed:', err.message);
});
```

### Fix 6d: Resolve or document TODO comments

For each TODO:
- `api/src/mcp/server.ts:92,117` — resolved by Fix 03 (MCP auth)
- `api/src/routes/mcp.ts:25` — resolved by Fix 03 (MCP transport)
- `e2e/*.spec.ts` — these are legitimate test TODOs, add a tracking issue link

## Files to create

- `api/src/lib/logger.ts`
- `webapp/src/lib/config.ts`

## Files to modify

- `api/package.json` — add `pino` (and optionally `pino-pretty` as devDep)
- `api/src/index.ts` — use logger
- `api/src/services/blueprints.ts` — use logger
- `api/src/services/search.ts` — use logger
- `webapp/src/lib/api.ts` — import API_URL from config
- `webapp/src/lib/auth-client.ts` — import API_URL from config
- `webapp/src/routes/blueprints/$blueprintId.tsx` — add warning to catch
- `cli/src/commands/pull.ts` — add warning to catch

## Acceptance criteria

- [ ] Zero `console.log`/`console.error` in `api/src/` (except tests)
- [ ] `API_URL` defined in one place in webapp
- [ ] Silent `.catch(() => {})` replaced with `.catch((err) => console.warn(...))`
- [ ] `pnpm check && pnpm check-types && pnpm test` passes
