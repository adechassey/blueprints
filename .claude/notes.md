
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
- transformers.js v3 statically imports `onnxruntime-node` with NO WASM fallback in Node — you can't drop the package, only unused platform binaries (see `excludeFiles` discussion in api/vercel.json if cold starts become an issue).

## Vercel deploy (API)
- `api/src/app.ts` MUST keep a default export (`export { app as default }`): Vercel's native Hono support resolves the entry through package exports and requires a default function export. Removing it = every invocation fails with `Invalid export found in module ... The default export must be a function or server` and FUNCTION_INVOCATION_FAILED 500s.
- Debug prod crashes with `vercel logs <deployment-url>` (CLI logged in as adechassey) — the actual error only shows there, never in the browser console.
- `vercel projects ls` shows the two projects: blueprints-api (rootDirectory=api, api/vercel.json) and blueprints-webapp (root vercel.json, SPA).

## react-syntax-highlighter + Vite
- ALWAYS destructure `{ default: grammar }` from the dynamic language imports — the import() returns a namespace object, and refractor's register throws `Cannot convert object to primitive value` (null-prototype object string-concat) when given one.
- Import via explicit `dist/esm/...` subpaths WITH `.js` extension (`prism-light.js`, `styles/prism/one-dark.js`, `languages/prism/tsx.js`): the package main resolves to CJS and mixing it with ESM subpaths creates broken interop wrappers. The @types package only covers extensionless paths — add local `declare module` for the `.js` subpaths (webapp/src/types/react-syntax-highlighter.d.ts).
- Debugging prod-only rendering bugs: build + `vite preview` + Playwright with a mocked `**/api/auth/get-session` route (fake `{ user, session }` payload) bypasses Better Auth without the API.
