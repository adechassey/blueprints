# Production Deploy Plan — Vercel + Neon

## Architecture Overview

```
                    ┌─────────────┐
                    │  Vercel CDN  │
                    │  (webapp)    │
Users ──────────────┤              │
                    │  Serverless  │──── Neon PostgreSQL
                    │  (api/*)     │     (pgvector)
                    └─────────────┘
```

- **Webapp**: Static SPA build served from Vercel CDN
- **API**: Hono app deployed as Vercel serverless functions under `/api/*`
- **Database**: Neon PostgreSQL with pgvector extension
- **Auth**: Google OAuth via Better Auth
- **Search**: Transformers.js embedding model loaded in a dedicated serverless function

---

## Step 1: Neon Database Setup

### 1a. Create Neon project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project: `blueprints-prod`
3. Region: choose closest to your Vercel region (e.g., `eu-central-1` for Europe)
4. Note the connection string: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### 1b. Enable pgvector

```sql
-- Run in Neon SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1c. Apply migrations

```bash
# From local machine, with DATABASE_URL pointing to Neon
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" \
  pnpm db:migrate
```

### 1d. Seed initial data (optional)

```bash
DATABASE_URL="postgresql://..." pnpm db:seed
```

---

## Step 2: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Set **Authorized JavaScript origins**:
   - `https://your-domain.vercel.app`
   - `https://your-custom-domain.com` (if applicable)
4. Set **Authorized redirect URIs**:
   - `https://your-domain.vercel.app/api/auth/callback/google`
   - `https://your-custom-domain.com/api/auth/callback/google`
5. Note Client ID and Client Secret

---

## Step 3: Vercel Project Setup

### 3a. Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the Git repository
3. Framework preset: **Other** (we'll configure manually)
4. Root directory: `.` (monorepo root)

### 3b. Build settings

| Setting | Value |
|---------|-------|
| Build Command | `pnpm build` |
| Output Directory | `webapp/dist` |
| Install Command | `pnpm install` |
| Node.js Version | `22.x` |

### 3c. Vercel configuration file

Create `vercel.json` at the project root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": "webapp/dist",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/src/index.ts": {
      "memory": 256,
      "maxDuration": 10
    },
    "api/src/routes/embeddings.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

> **Note**: The Hono API needs to be adapted for Vercel serverless. You may need to create an `api/index.ts` entry point that exports the Hono app's fetch handler for Vercel's serverless runtime. See Step 4.

### 3d. Environment variables

Set these in Vercel Dashboard > Settings > Environment Variables:

| Variable | Value | Environments |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` | Production, Preview |
| `BETTER_AUTH_SECRET` | `<openssl rand -base64 32>` | Production, Preview |
| `GOOGLE_CLIENT_ID` | `<from Google Cloud Console>` | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | `<from Google Cloud Console>` | Production, Preview |
| `BETTER_AUTH_URL` | `https://your-domain.vercel.app` | Production |
| `CORS_ORIGIN` | `https://your-domain.vercel.app` | Production |
| `ADMIN_EMAILS` | `hugo.borsoni@theodo.com,...` | Production, Preview |
| `VITE_API_URL` | `https://your-domain.vercel.app` | Production |
| `LOG_LEVEL` | `info` | Production |

---

## Step 4: Adapt API for Vercel Serverless

Vercel serverless functions expect a specific entry point. Create a Vercel-compatible wrapper:

```typescript
// api/index.ts (Vercel entry point)
import { handle } from 'hono/vercel';
import { app } from './src/app.js';

export default handle(app);
```

This uses `hono/vercel` adapter to bridge Hono's fetch-based handler to Vercel's serverless format.

Install the adapter if not already present:
```bash
pnpm --filter api add @hono/vercel
```

---

## Step 5: Deploy

### 5a. First deploy

```bash
# Push to main branch (or the branch connected to Vercel)
git push origin main
```

Vercel auto-deploys on push. Monitor the build in the Vercel dashboard.

### 5b. Verify deployment

| Check | URL | Expected |
|-------|-----|----------|
| Health | `https://your-domain.vercel.app/api/health` | `{"status":"ok"}` |
| Webapp | `https://your-domain.vercel.app` | SPA loads |
| OAuth | Click login | Google OAuth flow completes |
| API | `https://your-domain.vercel.app/api/blueprints` | JSON response |
| MCP | `POST /api/mcp` with auth | tools/list returns 7 tools |

### 5c. Seed production data

```bash
DATABASE_URL="<neon-connection-string>" pnpm db:seed
```

---

## Step 6: Custom Domain (optional)

1. In Vercel Dashboard > Settings > Domains
2. Add your custom domain (e.g., `blueprints.theodo.com`)
3. Update DNS records as instructed by Vercel
4. Update environment variables:
   - `BETTER_AUTH_URL` → `https://blueprints.theodo.com`
   - `CORS_ORIGIN` → `https://blueprints.theodo.com`
   - `VITE_API_URL` → `https://blueprints.theodo.com`
5. Update Google OAuth redirect URIs

---

## Step 7: Post-Deploy Monitoring

### Logs
- **Vercel**: Dashboard > Deployments > Function Logs (pino JSON output)
- **Neon**: Dashboard > Monitoring > Query stats

### Key metrics to watch
- Serverless function cold starts (especially embeddings)
- Database connection count (Neon has connection limits)
- Rate limit hits (429 responses)
- Auth failures (401 patterns)

---

## Rollback

If something goes wrong:
1. **Vercel**: Dashboard > Deployments > click previous deployment > "Promote to Production"
2. **Database**: Neon supports branching — create a branch before migrations for safety

---

## Neon Preview Branches (stretch goal)

For PR preview environments with isolated databases:

1. Enable Neon integration in Vercel
2. Each Vercel preview deployment gets its own Neon branch
3. Branch is auto-created from production, auto-deleted on PR close
4. Set `DATABASE_URL` per preview via Neon-Vercel integration
