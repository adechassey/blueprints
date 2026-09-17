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
