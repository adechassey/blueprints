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
