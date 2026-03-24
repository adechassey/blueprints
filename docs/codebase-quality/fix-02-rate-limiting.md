# Fix 02: Rate Limiting & Download Count Protection

**Severity**: High
**Report refs**: 3.1, 3.2, 3.3

## Problem

- No rate limiting on any endpoint
- `POST /api/blueprints/:id/download` is unauthenticated and can be spammed to inflate counts
- `POST /api/embeddings` and `GET /api/blueprints/search` are expensive (ML inference) with no protection

## Solution

### Step 1: Install rate limiting middleware

```bash
pnpm --filter api add hono-rate-limiter
```

Or use a simple in-memory rate limiter (fine for single-process Vercel functions):

### Step 2: Create rate limiter middleware — `api/src/middleware/rate-limit.ts`

```typescript
import { rateLimiter } from 'hono-rate-limiter';

// General API rate limit: 100 req/min per IP
export const generalRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

// Strict rate limit for expensive operations: 10 req/min
export const strictRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

// Download endpoint: 5 req/min per IP per blueprint
export const downloadRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (c) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown';
    const id = c.req.param('id');
    return `${ip}:${id}`;
  },
});
```

### Step 3: Apply rate limits in `api/src/app.ts`

```typescript
app.use('/api/*', generalRateLimit);
```

### Step 4: Apply strict limits on expensive endpoints

```typescript
// In routes/search.ts
searchRoutes.get('/blueprints/search', strictRateLimit, ...);

// In routes/embeddings.ts
embeddingsRoute.post('/embeddings', strictRateLimit, ...);

// In routes/blueprints.ts
blueprintRoutes.post('/blueprints/:id/download', downloadRateLimit, ...);
```

### Step 5: Add IP-based deduplication for download counts (optional improvement)

Instead of just rate limiting, track recent downloads per IP to prevent the same client from incrementing the count multiple times within a time window. A simple approach: check a `recent_downloads` table or use an in-memory set with TTL.

## Files to create

- `api/src/middleware/rate-limit.ts`

## Files to modify

- `api/package.json` — add `hono-rate-limiter` dependency
- `api/src/app.ts` — apply general rate limit
- `api/src/routes/search.ts` — apply strict rate limit
- `api/src/routes/embeddings.ts` — apply strict rate limit
- `api/src/routes/blueprints.ts` — apply download rate limit

## Acceptance criteria

- [ ] General rate limit applied to all `/api/*` routes
- [ ] Strict rate limit on search and embedding endpoints
- [ ] Download endpoint rate-limited per IP per blueprint
- [ ] Rate limit headers returned in responses (`X-RateLimit-*`)
- [ ] `pnpm check && pnpm check-types && pnpm test` passes
