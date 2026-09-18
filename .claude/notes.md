# Notes — base de connaissance partagée

## Technologies & layers (2025-09)

- L'enum `blueprint_stack` (server/webapp/shared/fullstack) a été supprimé : les blueprints
  sont rattachés à des **technologies** (table `technologies` + join `blueprint_technologies`),
  et `layer` est un **enum fermé** (`database, api, domain, ui, state, infra, testing, tooling`).
  C'est l'axe de regroupement pour le futur `scaffold` CLI (remonter un boilerplate complet).
- **Gotcha drizzle-kit** : `pgEnum` ne peut pas importer les constantes depuis
  `@blueprints/shared` (le bundler de drizzle-kit ne résout pas les sources TS workspace) —
  les valeurs sont dupliquées littéralement dans `api/src/db/schema.ts`.
- **Gotcha drizzle-kit generate** : retirer un enum + en créer un autre dans la même migration
  déclenche un prompt interactif de « rename detection » (échoue hors TTY). Découper en deux
  migrations successives (drop d'abord, create ensuite).
- **Gotcha drizzle-kit migrate** : en cas d'échec silencieux (exit 1 sans message), vérifier vers
  quelle base pointe `DATABASE_URL` — ici `.env.local` pointe vers Neon (remote), pas vers la DB
  Docker locale. Migrer la DB locale : `DATABASE_URL=postgresql://blueprints:blueprints@localhost:5433/blueprints pnpm --filter api db:migrate`.
- Les valeurs enum/text sont des identifiants SQL : lors d'inserts manuels dans
  `drizzle.__drizzle_migrations`, quoter les hash sinon Postgres les tronque à 63 chars.
- Les migrations doivent être idempotentes sur des données existantes : la migration 0007
  remappe les layers texte legacy avant le cast vers l'enum.
- Vitest résout `@blueprints/shared` vers `dist/` : après modification des schémas partagés,
  relancer `pnpm --filter @blueprints/shared build` sinon erreurs d'exports fantômes.
- Paraglide : après modification de `webapp/messages/en.json`, recompiler avec
  `pnpm exec paraglide-js compile --project ./project.inlang --outdir ./src/paraglide`.

## À venir

- Concept de **stacks** (presets nommés de technologies, tables `stacks` / `stack_technologies`)
  + commande CLI `blueprint stack scaffold <stack>` : fetch des blueprints des technos du stack,
  groupés par layer, génération du boilerplate.

## Prod outage healing (2026-09-16) — resolved
- Cause: migrations 0005-0008 (stacks/technologies WIP, drop `blueprints.stack`, layer→enum) were applied to the PROD Neon DB while the deployed API (origin/main, 22h old) still queried `stack` → every blueprints query failed fast (500 "Failed query"); projects/tags/users kept working (only the blueprints table was touched).
- Heal = DB rollback to the deployed schema: re-created `blueprint_stack` enum + `stack` column, cast `layer` back to text, restored the original (stack, layer) per blueprint **from the API data captured earlier in the session** (id→(stack,layer) mapping — capture API list responses before migrating!). Purged the 4 new `drizzle.__drizzle_migrations` rows and dropped the empty WIP tables/types so `drizzle-kit migrate` replays 0005-0008 cleanly when the stacks code ships.
- Roll forward was NOT viable: HEAD at that time failed turbo (api coverage <100%, webapp check-types) — validate a commit in a `git worktree` before pushing to heal.
- LD blueprints then re-synced with the full-body extract CLI (worktree at the fix commit, since current main's CLI no longer has `--stack`): 1 created (atomic-permission) + 43 updated, extracts now median ~29 code lines.
- Vercel CLI notes: global install was broken (`npx -y vercel` works); `vercel env pull` on a project with the Neon integration exposes DATABASE_URL; the root `.vercel/repo.json` pointed at a stale project (`api`) — the real one is `blueprints-api` (`vercel projects ls` shows which project owns the prod domain).
- Vercel projects (2026-09-17): the repo is linked to exactly two Vercel projects — `blueprints-api` (root `api`) and `blueprints-webapp` (root `webapp`). A stray GitHub-linked project named `api` (root = repo root) was created on 2026-09-17 and deleted the same day: it posted a duplicate "Vercel – api" check on every PR and always failed on the Hobby limit of 12 serverless functions (it bundled the whole monorepo). Never link/deploy from the repo root — use `.vercel/repo.json` (monorepo link) or `npx -y vercel --cwd api`. `vercel project rm` has no `--yes` flag; delete non-interactively with `DELETE https://api.vercel.com/v9/projects/<id>?teamId=<team>` (token in `~/Library/Application Support/com.vercel.cli/auth.json`).
- Neon previews (2026-09-17): `blueprints-api` preview deployments fail with "Resource provisioning failed" at the integrations step (no build log) when the Neon Free project (`winter-mountain-20626733`, 10 branches max) is full — every git branch that gets a preview costs one Neon branch. GitHub "Automatically delete head branches" is now ON, so merged branches (and their Neon branches) get cleaned up; prune old preview branches from the Neon console if it happens again.

## Stacks WIP finalized + deployed (2026-09-17)
- Fixed the WIP to green: api branch coverage (null-description scaffold index test), knip unused exports (un-export StackSlugConflictError/getStackBlueprints/LayerGroup — the 409 mapping flows through the global error handler via `err.status`), e2e stacks spec (seedBlueprint double `e2e-` prefix: fixture 'E2E Layered' → slug `e2e-e2e-layered-*`; and the scaffold feed returns version CONTENT, not usage), dead e2e helpers (deleteBlueprintRows, E2E_API_URL).
- Search e2e regression root cause: with the HF model now cached in /tmp/transformers-cache, `generateEmbedding` SUCCEEDS despite HF_HUB_OFFLINE=1 → vectorSearch runs → `embedding IS NOT NULL` filters out every e2e version → silent empty results. semanticSearch now falls back to textSearch when the vector search returns zero items (also protects prod blueprints whose embedding job failed).
- Deploy runbook executed: push main → wait `vercel ls` Production Ready → `vercel env pull` (DATABASE_URL) → `drizzle-kit migrate` → smoke test (list/detail/search/stacks/webapp all 200). Between deploy and migrate there is a 500 window on writes with enum layers — keep the two steps tight.
- macOS gotcha: `date +%s%3N` does not work (BSD date prints a literal N) — use `python3 -c 'import time; print(int(time.time()*1000))'` for ms stamps.

## Sync excerpt: statement continuation (2026-09-17)
- The bracket-balanced extract (3711e2b) still cut declarations whose FIRST line opens no bracket: `export const schema = z` + `.object({…}).merge(…)` synced as 1 line (LD isoutc-url-param), NestJS `@Injectable()`/`@Post()` + class/method kept only the decorator lines, `})` + `.merge(` lost the tail. A statement now ends when brackets balance AND nothing continues it (trailing `=`/`=>`/operator on the comment-stripped code, next code line starting with `.`/`|`/`?`/`:`/`as`); decorators (and comments after them) lead into the declaration.
- Deliberately NOT continuations: trailing `,` (an annotated array/object entry ends with one — it would swallow the sibling entries), `...` (Python `class A: ...`), `++`, operators inside a trailing comment.
- Validate extractor changes by sweeping EVERY annotation site (`@Blueprint` + `@FollowsBlueprint`) of real repos, old vs new, not just the index rows: pcl-sig-web 15/1546 and Aquila 238/1078 excerpts changed, all reviewed. Filter the changed ones on "last line is not `;`/`}`/`)`" to spot cut excerpts, and on "a later line at the declaration indent" to spot over-grabs.
- Excerpts cut by MAX_EXCERPT_LINES now carry a markdown note (`extractExcerpt` returns `{ code, truncated }`) — 3 LD blueprints are 200–300-line components.
- `future-of-software/skills/blueprint/extract.sh` is an awk port of the same algorithm — keep them in sync (parity check: extract.sh code blocks vs `extractExcerpt` + dedent, 143/143 identical). Its block-comment scan also had a bug (gave up on the first char that wasn't `*/`, so a JSDoc ` */` never closed and the extract ran to the cap).
- JS/TS lexical rules (`ScanState.js`, selected from the exemplar path): a `'`/`"` right after an identifier char is JSX text (`Choix de l'imprimante`), a `'`/`"` literal never spans lines (closed at EOL unless the line ends with `\`), and `#` is a private member, not a comment. The apostrophe risk was NOT visible on the 44 index exemplars but hit 5 `@FollowsBlueprint` sites — sweep all annotation sites, not just the index.
- awk port gotcha (macOS awk 20200816, UTF-8 locale): substr is byte-based, but a REGEX or `<`/`>` comparison on a lone byte of a multibyte char aborts (`towc: multibyte conversion failure`) or uses strcoll. Test single bytes with `index()` (ASCII table built in BEGIN) and run regexes only on whole lines. Also never put a `'` in a comment of a single-quoted awk program.
- Re-sync is cheap: `updateBlueprint` only creates a version when content changed. Dry-run from the source repo root (TSV locations are cwd-relative): `<worktree>/cli/node_modules/.bin/tsx <worktree>/cli/src/index.ts sync <tsv> --project lefebvre-dalloz-sig-web --repo elsgestion/pcl-sig-web --dry-run`. The LD repo has no committed `docs/blueprints.tsv`: generate it with its `index.sh` into a scratch dir.

## Webapp taxonomy UI + code review fixes (2026-09-17)
- **Technology references**: clients send catalog slugs (`react`) or display names (`Node.js`). The API resolves slug first, then name case-insensitively (`services/technologies.ts`), dedupes, and resolves BEFORE any write. The old blueprint upsert looked up the lowercased input by `name` → every catalog technology ("React") re-inserted slug `react` → 500. The E2E DB has no seeded catalog, which is why no test caught it; `e2e/technologies.spec.ts` now inserts a display-name technology.
- Stack membership is **any-match**: a generic technology in a stack (TypeScript) pulls every TypeScript blueprint into the stack page and `stack scaffold` (e.g. a NestJS controller in a Node/React stack).
- **shadcn on this app**: no `components.json`. Components are ported by hand from `https://ui.shadcn.com/r/styles/new-york-v4/<name>.json` onto the M3-named tokens (`bg-popover` → `bg-surface-container-lowest`, `border-input` → `border-outline-variant`, `bg-accent` → `bg-surface-container-high`), relative `.js` imports, only used subcomponents exported (knip). Animations need `tw-animate-css` (CSS import → listed in knip `ignoreDependencies`).
- Radix Select items cannot have an empty value: use a sentinel (`all`, `none`).
- **Popover inside a Radix Dialog**: the dialog's scroll lock swallows wheel events on the portaled list → `<Popover modal>`. A hand-rolled dialog with a document Escape listener closed itself when Escape dismissed a nested popover; the Radix Dialog stacks layers.
- Creatable combobox: render the "Add …" item LAST, otherwise Enter creates "type" instead of picking TypeScript.
- **Previewing signed-in pages locally**: run the API on the E2E DB (env from `playwright.config.ts`), insert a user + session, sign the cookie like `e2e/helpers/auth.ts` (HMAC-SHA256 of the token with the E2E secret), set `blueprints.session_token` on `localhost`. `cleanupE2eData` does not delete `blueprint_tags`: preview data with tags breaks every E2E cleanup until those links are removed.
- agent-browser's `mouse wheel` only scrolls the window, never an inner overflow element: verify scroll behaviour with Playwright `page.mouse.wheel`.
- Lefthook runs its four commands in parallel and each re-runs pnpm's `prepare`; when node_modules and package.json disagree (e.g. a stashed dependency change) `check` can fail spuriously. Rerun before investigating.
- The search text fallback (above) now fires only when NO embedded blueprint matches the filters; an empty vector page past the end stays empty, so paging never switches index mid-way.

## Prod re-sync with classification (2026-09-17)
- `sync` now classifies each row from its exemplar file: layer from the path (then globs), technologies from imports. Imports cannot see wrapped clients (LD's `@/server/core/db/client`, Aquila's Prisma → SQL Server): split the TSV by path and pass `--techno` per subset (LD repositories: `Next.js,Kysely,Oracle Database`, LD rest: `Next.js`; Aquila by package: `target/server` → `Nest.js` (+ `SQL Server` for repositories/adapters), `target/webapp` → `Vite`, `target/schemas` → nothing).
- Always dry-run first: it prints layer (flagging fallbacks) and technologies per row. Run the CLI from source (`cli/node_modules/.bin/tsx cli/src/index.ts sync …`) with cwd = the synced repo root, since exemplar paths are relative. Write the TSV to a scratch dir, not the client repo.
- Aquila (pr-aquila-ap-v2) has no index.sh (its skill writes a markdown index). LD's generic `index.sh` works on it: `bash <pcl-sig-web>/.claude/skills/blueprint/index.sh <out>.md target/server/src target/webapp/src target/schemas/src`.
- Aquila prod slugs had been derived from names by the seed (`count-endpoint`) while the code uses pattern ids (`controller-count`): a sync would have created duplicates. 28 slugs were renamed by name match (PUT `{slug}`: same id, history kept) before syncing. Result: 84 updated, 15 created; `service-admin-lifecycle-transition` is no longer annotated in code and stays as is.
- Migration 0009 was already applied on prod when the runbook's `db:migrate` ran after the PR #17 deploy (Vercel builds do not migrate; another session may have run it). Check `GET /api/technologies` rather than assuming.
- zsh gotcha: `path` is tied to `PATH`, so `for path in …` in a shell loop wipes the command search path ("command not found: curl"). Use another variable name.
- Stacks match blueprints carrying ANY of their technologies, so a stack must list project-specific technologies only (TypeScript/React/Zod/TanStack Form/Table are shared by both projects). Prod stacks: `sig-web-nextjs-oracle` (Next.js, Kysely, Oracle Database → 44/44 SIG Web) and `aquila-nestjs-react` (Nest.js, Prisma, SQL Server, Vite, TanStack Router, TanStack Query → 87/100 Aquila, 0 leaked). The 12 blueprints of Aquila's framework-agnostic `schemas` package carry no Aquila-only technology and are not in its stack.

## Previewing signed-in PROD pages (2026-09-17)
- The webapp's login redirect is client-side only (`useSession` → `/api/auth/get-session`), and the blueprint GET endpoints (detail, versions, comments, matches) are public. To render a prod page in agent-browser without Google SSO: `agent-browser open --init-script <file.js>` where the script patches `window.fetch` to answer `/api/auth/get-session` with a fake `{session, user}` (role `user`, or `admin` to see Edit/Delete), then `navigate` to the page.
- `agent-browser network route … --body` does NOT work for that endpoint: the API is on another origin (`blueprints-api.vercel.app`), so the CDP-fulfilled response fails CORS and the session comes back null. `addinitscript` does not exist in agent-browser 0.36 — use `open --init-script`. `set viewport <w> <h>` is the viewport command (`viewport` alone is unknown).

## Blueprint ownership + deploy ordering (2026-09-18)
- **Blueprints belong to exactly one project** (`blueprints.project_id` NOT NULL, `UNIQUE (project_id, slug)`); `blueprint_projects` is gone. Reuse is a **fork**: `POST /blueprints/:id/fork` copies content, metadata, technologies and tags into another project and records `forked_from_id`. Write access follows the project (any member), and a project that still owns blueprints cannot be deleted.
- Rolled out expand → contract: 0010 added the columns + backfill while the code kept dual-writing the join table, then 0011 added the constraints and dropped it once the new release was live. Prod verified between the two: 144 blueprints, 100 aquila-ap + 44 lefebvre-dalloz-sig-web, 0 orphans, no duplicate (project, slug).
- **`.github/workflows/db-migrate.yml` migrates prod automatically** on any push to main touching `api/src/db/migrations/**` — the manual `db:migrate` in the deploy runbook is redundant (it also explains migrations appearing "already applied"). It races the Vercel deploy: for PR #19 the DROP ran ~2 min before the code that stopped writing to the table. The workflow now waits for the `Production – blueprints-api` GitHub deployment of the same commit before migrating.
- Verifying prod schema without the Vercel CLI: `cd api && node_modules/.bin/tsx --env-file=.env.local <script>` with a `postgres` client imported by absolute path (a scratch-dir script cannot resolve workspace packages).
- CLI **0.6.0** released (`git tag cli-v0.6.0` → the cli-release workflow builds the four platform bundles): project required on push/sync, `fork`, exemplar-based layer/technology classification, scaffold collision handling. Older CLIs keep working because the blueprint payload still exposes a derived `projects` array.
- Aquila's `service-admin-lifecycle-transition` (seeded in March, never annotated in the code) was deleted from prod; its markdown still lives at `webapp/src/assets/blueprints/service-admin-lifecycle-transition.md` if it ever needs to come back.
## Blueprint detail page rework (2026-09-18)
- **Content model**: a synced version's content is the excerpt only (`buildBlueprintContent`); description, usage and source are fields the page renders once. Content synced before that change still opens with `## Context / ## Usage / ## Implementation`: `stripSyncedPreamble` drops that preamble only when it matches the fields exactly, so a prod re-sync is optional (it would shrink stored content and create one version per blueprint).
- The `@Blueprint…` comment header of an excerpt is folded by the renderer (`splitAnnotationHeader`), copy keeps it. Description and usage go through `InlineCodeText` (backtick spans only, no markdown: a glob's asterisks stay literal). The source stays plain text: repositories live on GitHub, GitLab, Bitbucket or elsewhere and are private to their client, so a guessed link would 404 for most readers.
- Prism themes: every `react-syntax-highlighter/dist/esm/styles/prism/*.js` module needs its own declaration in `webapp/src/types/react-syntax-highlighter.d.ts`.
- JSDoc gotcha: a `*/` inside a comment example (a glob like `a/*/b/*`) closes the comment and breaks the file.
- **Previewing a branch locally with real-looking data**: seed the E2E DB through `e2e/helpers/db.ts` from a script written as `async function main()` (the root package is CommonJS, so tsx rejects top-level await and a `.mts` cannot import the helper), run the API with the playwright env plus `CORS_ORIGIN=http://localhost:<vite port>`, and mock the session in-page as in "Previewing signed-in PROD pages" above. Stop that API before `playwright test`: `reuseExistingServer` would pick it up with the wrong CORS origin.
