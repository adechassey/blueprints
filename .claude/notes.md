
## Webapp design system (2025 redesign)
- The CSS token NAMES are M3 heritage (`--surface-container-*`, `--on-surface-variant`, `--outline-variant`) but the VALUES define the new look (zinc + indigo). Keep using these class names in markup; do NOT reintroduce M3 visual patterns (heavy blurred shadows, uppercase badges).
- pnpm 11: `pnpm` field in package.json is IGNORED; build-script approvals live in `pnpm-workspace.yaml` under `allowBuilds` (map of `pkg: true/false`). Unapproved builds fail the install with `ERR_PNPM_IGNORED_BUILDS`.
- TanStack Router code splitting: `TanStackRouterVite({ autoCodeSplitting: true })` (NOT `enableCodeSplitting`, which is experimental-only in this version).
- react-syntax-highlighter: always use `PrismLight` + explicit `registerLanguage` inside a `lazy()` factory — the default `Prism` import pulls every language (~400 kB).
- Paraglide: messages with params throw TS errors if called without them (`m.search_results_title({ query })`).
- knip runs in pre-commit: new exported-but-unused symbols will block commits. Fix or don't export.

## API / Vercel
- `api/bundle.mjs` marks `@huggingface/transformers` as external → Vercel file-tracing ships the whole tree into the lambda, including `onnxruntime-node`'s 208 MB of native binaries for all 6 platforms. This pushed the function to 430 MB uncompressed (> 250 MB legacy limit).
- Fix applied (2025): `VERCEL_SUPPORT_LARGE_FUNCTIONS=1` env var on the Vercel api project (large functions beta). `VERCEL_ANALYZE_BUILD_OUTPUT=1` gives a detailed bundle report.
- transformers.js v3 statically imports `onnxruntime-node` with NO WASM fallback in Node — you can't drop the package, only unused native binaries.
- Final fix (sizes from `VERCEL_ANALYZE_BUILD_OUTPUT=1` build report): function went 430 MB → 68 MB.
  - `excludeFiles` in `api/vercel.json` prunes onnxruntime-node's non-linux + CUDA/TensorRT binaries. GOTCHAS: (1) with Vercel's native Hono support the functions key must be the ENTRYPOINT FILE that literally imports `hono` (`src/app.ts`), not the route (`/` is rejected) and not `index.ts` (doesn't import hono, never matches); (2) nft matches ignore globs with picomatch WITHOUT `dot: true`, so `.pnpm` must appear literally in the pattern; (3) validate globs locally against real traced paths before pushing — silent no-ops are the failure mode.
  - onnxruntime-node's postinstall auto-extracts CUDA/TensorRT EP libs on linux x64 (~273 MB, invisible on macOS dev machines). `ONNXRUNTIME_NODE_INSTALL_CUDA=skip` project env var skips it, but only takes effect on a fresh install — the Vercel build cache restores extracted node_modules and pnpm skips postinstall when up-to-date.
  - Vercel CLI `redeploy` re-runs the build but didn't honor `VERCEL_SUPPORT_LARGE_FUNCTIONS` (failed at 250 MB); git-triggered deploys behaved differently. Don't rely on the flag alone — get under 250 MB.
- Device flow (RFC 8628) for CLI login: routes live at `/api/auth/device/*` and MUST be registered in `app.ts` BEFORE the Better Auth catch-all `app.all('/api/auth/*')` (Hono matches registration order). Approval creates a dedicated session row for the CLI (independently revocable). E2E-verified on prod 2026-09-15. Gotchas: drizzle-kit migrate with prod creds — `node --env-file=...` fails on the .bin sh shim; use `export $(grep '^DATABASE_URL=' .env.local | xargs)` instead. knip flags exports used only within their own module.
- Embeddings backfill: use `api/scripts/backfill-embeddings.ts` (`pnpm --filter api embeddings:backfill`, pass `--env-file=.env.local` for prod creds from `vercel env pull`). It runs the pipeline LOCALLY — the `/embeddings/backfill` route processes all versions in one serverless request and will time out on large sets. Prod DB (85 versions) already fully embedded as of 2026-09-15; semantic vector search verified live (keyword-free query ranks correctly).

## Vercel deploy (API)
- `api/src/app.ts` MUST keep a default export (`export { app as default }`): Vercel's native Hono support resolves the entry through package exports and requires a default function export. Removing it = every invocation fails with `Invalid export found in module ... The default export must be a function or server` and FUNCTION_INVOCATION_FAILED 500s.
- Debug prod crashes with `vercel logs <deployment-url>` (CLI logged in as adechassey) — the actual error only shows there, never in the browser console.
- `vercel projects ls` shows the two projects: blueprints-api (rootDirectory=api, api/vercel.json) and blueprints-webapp (root vercel.json, SPA).

## react-syntax-highlighter + Vite
- ALWAYS destructure `{ default: grammar }` from the dynamic language imports — the import() returns a namespace object, and refractor's register throws `Cannot convert object to primitive value` (null-prototype object string-concat) when given one.
- Import via explicit `dist/esm/...` subpaths WITH `.js` extension (`prism-light.js`, `styles/prism/one-dark.js`, `languages/prism/tsx.js`): the package main resolves to CJS and mixing it with ESM subpaths creates broken interop wrappers. The @types package only covers extensionless paths — add local `declare module` for the `.js` subpaths (webapp/src/types/react-syntax-highlighter.d.ts).
- Debugging prod-only rendering bugs: build + `vite preview` + Playwright with a mocked `**/api/auth/get-session` route (fake `{ user, session }` payload) bypasses Better Auth without the API.

## Sync CLI ↔ blueprint skill (future-of-software)

- `theodo-blueprints sync` pushes the skill's TSV index (`docs/blueprints.tsv`, from `index.sh`) to the registry. Slug = pattern-id → idempotent (create vs update via GET-by-slug).
- **Gotcha**: `@blueprints/shared` resolves via `dist/` at runtime (see package.json exports). After editing shared schemas, run `pnpm --filter @blueprints/shared build` or the API silently strips the new fields (zod schema stale).
- **Gotcha**: `updateBlueprint` used to regenerate the slug from `name` on every PUT — synced blueprints now pin the slug explicitly. Fix in `blueprints.ts`: explicit `slug` wins, otherwise regenerate only when the name actually changed.
- **Bug fixé**: `getBlueprintById` accepte un slug mais faisait les jointures (tags/projets) avec l'id brut → requêtes cassées sur lookup par slug.
- Runtime test env: API needs `DATABASE_URL` (docker: `postgresql://blueprints:blueprints@localhost:5433/blueprints`), `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`. Bearer token = Better Auth session token (insertable directly in DB for local tests). CLI config: `~/.theodo-blueprints/config.json`.
- Pre-commit hook runs repo-wide `biome check .` + knip: uncommitted WIP from other work (e.g. e2e suite) can block commits — check the failing file isn't yours before `--no-verify`.

## CLI release & local install

- `install.sh` / `install.ps1` only ever install the **latest GitHub release**. To ship new CLI commands: `git tag cli-vX.Y.Z origin/main && git push origin cli-vX.Y.Z` → the `CLI Release` workflow (~2 min) builds the tarballs → re-run the install command. Tag from `origin/main`, not a feature branch.
- To test unreleased CLI code locally: `pnpm --filter cli bundle` then `sudo cp cli/dist/theodo-blueprints.cjs /usr/local/bin/theodo-blueprints`.
- **Gotcha**: `theodo-blueprints --version` is hardcoded to `0.0.0` (cli/package.json + commander), so it can't tell installs apart — check `--help` for the command you expect instead.

## Git worktrees & pre-commit

- A fresh `git worktree` fails lefthook's pre-commit until you run, inside it: `pnpm install --offline --frozen-lockfile`, `pnpm --filter @blueprints/shared build`, and `cd webapp && pnpm exec paraglide-js compile --project ./project.inlang --outdir ./src/paraglide`. Symptoms otherwise: api tests fail on `Failed to resolve entry for package "@blueprints/shared"` and knip lists every `paraglide/messages.js` import as unresolved.
- **Gotcha**: `webapp/tsconfig.json` is a solution file (`files: []` + references), so a bare `tsc --noEmit` type-checks *nothing*. `check-types` runs `tsc -b` (same as the build, `noEmit` is set in both project files) — do not switch it back.
- After adding keys to `webapp/messages/en.json`, re-run the paraglide compile before `tsc` — `check-types` does not compile messages (only `build` does).

## Screenshotting pages behind Google SSO

- Reuse the e2e helpers (`createTestUser` + `authenticate` in `e2e/helpers`, from the e2e suite) in a throwaway `e2e/zz-*.spec.ts`: Playwright's `webServer` boots webapp + API against the docker e2e DB (port 5433), and the forged session cookie skips Google OAuth. `page.addInitScript((t) => localStorage.setItem('theme', t), 'dark')` before `goto` renders dark mode. Delete the spec afterwards.
## E2E suite (e2e/)
- Auth without OAuth: insert user + session rows via SQL (better-auth stores raw `generateId(32)` tokens), then forge the cookie `blueprints.session_token = token + '.' + base64(hmac-sh256(token, BETTER_AUTH_SECRET))` (signed cookies!) and `context.addCookies` before goto. Works on localhost despite `secure: true`.
- Playwright default runs SPEC FILES in parallel across workers even with `fullyParallel: false` (that only affects tests within a file). Shared DB + cleanup = flaky cross-file interference → set `workers: 1`.
- `reuseExistingServer: true` masks config drift: a stale manually-started API on the same port serves the tests with the WRONG env. `pkill -f "tsx src/index.ts"` before debugging.
- Read pino JSON logs to get the REAL pg error (hono error handler logs `err.cause` — the toast/API response only shows drizzle's "Failed query" wrapper).
- TanStack Router: a route file with BOTH a component and a directory of child routes swallows the children (component has no <Outlet/>). Pattern: `$id.tsx` = bare route (no component) + `$id/index.tsx` = the actual page.
- Rate limits broke E2E (100 req/min shared by 'unknown' IP when no x-forwarded-for) — now configurable via RATE_LIMIT_GENERAL/STRICT/DOWNLOAD.
- GitHub Actions: a PR whose merge into base is CONFLICTING (`mergeStateStatus: DIRTY`) does NOT trigger pull_request workflows at all — no run, no check, nothing. Resolve conflicts and the workflows appear on the next push.
