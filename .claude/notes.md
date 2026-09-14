
## Webapp design system (2025 redesign)
- The CSS token NAMES are M3 heritage (`--surface-container-*`, `--on-surface-variant`, `--outline-variant`) but the VALUES define the new look (zinc + indigo). Keep using these class names in markup; do NOT reintroduce M3 visual patterns (heavy blurred shadows, uppercase badges).
- pnpm 11: `pnpm` field in package.json is IGNORED; build-script approvals live in `pnpm-workspace.yaml` under `allowBuilds` (map of `pkg: true/false`). Unapproved builds fail the install with `ERR_PNPM_IGNORED_BUILDS`.
- TanStack Router code splitting: `TanStackRouterVite({ autoCodeSplitting: true })` (NOT `enableCodeSplitting`, which is experimental-only in this version).
- react-syntax-highlighter: always use `PrismLight` + explicit `registerLanguage` inside a `lazy()` factory — the default `Prism` import pulls every language (~400 kB).
- Paraglide: messages with params throw TS errors if called without them (`m.search_results_title({ query })`).
- knip runs in pre-commit: new exported-but-unused symbols will block commits. Fix or don't export.
