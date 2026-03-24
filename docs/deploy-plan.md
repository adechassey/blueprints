# Production Deploy Plan — Vercel + Neon

**Production URL**: `https://blueprints-webapp.vercel.app`
## Architecture

```
Users ──► Vercel CDN (webapp/dist — static SPA)
      ──► Vercel Serverless (/api/* — Hono app) ──► Neon PostgreSQL (pgvector)
```

---

## Step 1: Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create project `blueprints-prod`, region `eu-central-1`
3. Note the connection string: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
4. In SQL Editor, enable pgvector:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Apply schema from your local machine:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" \
     cd api && npx drizzle-kit push
   ```
6. Seed data (optional):
   ```bash
   DATABASE_URL="postgresql://..." pnpm db:seed
   ```

---

## Step 2: Google OAuth

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit (or create) your OAuth 2.0 Client ID
3. Add **Authorized JavaScript origins**:
   - `https://blueprints-webapp.vercel.app`
   - `https://blueprints-xxx.vercel.app` (your Vercel default domain)
4. Add **Authorized redirect URIs**:
   - `https://blueprints-webapp.vercel.app/api/auth/callback/google`
   - `https://blueprints-xxx.vercel.app/api/auth/callback/google`

You can reuse the same `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from local dev — just add the production URIs.

---

## Step 3: Code Changes (before first deploy)

### 3a. Create Vercel serverless entry point

The API currently uses `@hono/node-server` for local dev. Vercel needs a different adapter.

```bash
pnpm --filter api add @hono/vercel
```

Create `api/index.ts` (at the root of the `api/` package, not inside `src/`):

```typescript
import { handle } from '@hono/vercel';
import { app } from './src/app.js';

export default handle(app);
```

### 3b. Create `vercel.json`

Create at the monorepo root:

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
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

Notes:
- `rewrites`: sends `/api/*` to the serverless function, everything else to the SPA
- `functions.memory`: 1024MB needed for the Transformers.js embedding model (~90MB)
- `functions.maxDuration`: 30s to allow cold start + model loading

### 3c. Commit and push

```bash
git add vercel.json api/index.ts api/package.json pnpm-lock.yaml
git commit -m "chore: add Vercel serverless config"
git push
```

---

## Step 4: Vercel Project Setup

### 4a. Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `adechassey/blueprints` from GitHub
3. Framework preset: **Other**
4. Root directory: `.` (monorepo root)

### 4b. Build settings

These should be auto-detected from `vercel.json`, but verify:

| Setting | Value |
|---------|-------|
| Build Command | `pnpm build` |
| Output Directory | `webapp/dist` |
| Install Command | `pnpm install` |
| Node.js Version | `22.x` |

### 4c. Environment variables

Set in **Vercel Dashboard > Settings > Environment Variables**:

| Variable | Value | Environments |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` | Production, Preview |
| `BETTER_AUTH_SECRET` | *(generate with `openssl rand -base64 32`)* | Production, Preview |
| `GOOGLE_CLIENT_ID` | *(from Google Cloud Console)* | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | *(from Google Cloud Console)* | Production, Preview |
| `BETTER_AUTH_URL` | `https://blueprints-webapp.vercel.app` | Production |
| `CORS_ORIGIN` | `https://blueprints-webapp.vercel.app` | Production |
| `ADMIN_EMAILS` | `hugo.borsoni@theodo.com,antoine.de-chassey@theodo.com` | Production, Preview |
| `VITE_API_URL` | `https://blueprints-webapp.vercel.app` | Production |
| `VITE_PRODUCTION_URL` | `https://blueprints-webapp.vercel.app` | Production, Preview |
| `LOG_LEVEL` | `info` | Production |

**Important**: `VITE_*` variables are embedded at build time (Vite replaces them). All other variables are read at runtime by the serverless functions.

If using Vercel's default domain instead of a custom domain, replace `https://blueprints-webapp.vercel.app` with your Vercel URL (e.g., `https://blueprints-adechassey.vercel.app`).

---

## Step 5: Custom Domain (optional)

1. In Vercel Dashboard > Settings > Domains
2. Add `blueprints.theodo.com`
3. Add DNS records as instructed by Vercel (CNAME or A record)
4. Make sure all env vars use the custom domain (not the `.vercel.app` URL)
5. Update Google OAuth redirect URIs to include the custom domain

---

## Step 6: Deploy

### First deploy

Vercel auto-deploys when you push to the connected branch (usually `main`):

```bash
git push origin main
```

Or trigger a deploy from the Vercel dashboard.

### Verify

| Check | URL | Expected |
|-------|-----|----------|
| Health | `https://blueprints-webapp.vercel.app/api/health` | `{"status":"ok"}` |
| Webapp | `https://blueprints-webapp.vercel.app` | Login page loads |
| Auth | Click "Sign in with Google" | Google OAuth completes, redirects back |
| Blueprints | `https://blueprints-webapp.vercel.app/api/blueprints` | JSON response |
| Search | Search for a term | Results with similarity scores |

### Seed production data

If you haven't seeded in Step 1:

```bash
DATABASE_URL="<neon-connection-string>" pnpm db:seed
```

---

## Troubleshooting

### Build fails: "Cannot find module"
- Check that `api/index.ts` imports from `./src/app.js` (not `./app.js`)
- Make sure `@hono/vercel` is in `api/package.json` dependencies

### Auth returns 403 / "Invalid callbackURL"
- Check `BETTER_AUTH_URL` matches the actual domain
- Check `trustedOrigins` in `api/src/lib/auth.ts` includes `process.env.CORS_ORIGIN`
- Verify Google OAuth redirect URIs include `/api/auth/callback/google`

### CORS errors
- `CORS_ORIGIN` must match the exact origin (protocol + domain, no trailing slash)
- Preview deployments get a different URL — set `CORS_ORIGIN` for Preview env too, or use `*` for previews

### Embeddings timeout
- First request after cold start takes 10-30s (model download + loading)
- Subsequent requests are fast (model cached in memory within the function instance)
- If timeout persists, increase `maxDuration` in `vercel.json`

### Database connection errors
- Verify `DATABASE_URL` includes `?sslmode=require` for Neon
- Check Neon dashboard for connection limits (free tier: 5 concurrent)

---

## Rollback

1. **Vercel**: Dashboard > Deployments > click previous deployment > "Promote to Production"
2. **Database**: Create a Neon branch before running migrations for safety. Restore by switching back to the main branch.

---

## Preview Deployments

Each PR gets a preview URL from Vercel. For previews to work:
- `DATABASE_URL` must be set for Preview environment (same DB or Neon branch)
- `CORS_ORIGIN` for Preview: leave empty or set to `*` (or configure per-preview with Neon integration)
- Auth won't work on preview URLs unless you add each preview URL to Google OAuth redirect URIs. Workaround: use `VITE_PRODUCTION_URL` to redirect auth through the production domain.
