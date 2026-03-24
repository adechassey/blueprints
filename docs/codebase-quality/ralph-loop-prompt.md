# Ralph Loop Prompt — Codebase Quality Fixes

Use this as the prompt for a ralph loop session.

---

```
"You are fixing codebase quality issues in the Blueprints Server project.
  There are 7 fix specs in docs/codebase-quality/fix-01 through fix-07.

  ## Before your first iteration

  Read these files to understand the project and the fixes:
  - CLAUDE.md
  - docs/codebase-quality/report.md (the audit report)
  - All 7 fix specs: docs/codebase-quality/fix-01-shared-types.md through fix-07-tooling-guardrails.md

  ## Your workflow (every iteration)

  ### 1. Find the current fix

  Check which fixes are done by reading docs/codebase-quality/progress.json.
  If the file doesn't exist, create it:
  { \"fixes\": { \"01\": \"pending\", \"02\": \"pending\", \"03\": \"pending\", \"04\": \"pending\", \"05\": \"pending\", \"06\": \"pending\", \"07\": \"pending\" } }

  Pick the first fix with status \"pending\". If all are \"done\", output
  <promise>ALL_FIXES_APPLIED</promise> and stop.

  ### 2. Implement the fix

  Read the fix spec. Work through it methodically. After each logical step:
  - Run pnpm check && pnpm check-types to catch issues early
  - Run pnpm test if you added or modified tests
  - Fix any errors before moving to the next step

  ### 3. Verify

  When the fix is complete:
  - Run pnpm -w run check && pnpm check-types && pnpm test && pnpm -w run knip
  - ALL must pass with zero errors
  - Check each acceptance criterion from the fix spec

  ### 4. Commit and update progress

  - Stage all changes for this fix (be specific with git add, avoid .env files)
  - Commit with: fix(quality): {short description}
    - Add Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  - Update docs/codebase-quality/progress.json: set the fix to \"done\"
  - Continue to the next iteration

  ## Important ordering

  Fix 07 (tooling guardrails) MUST be implemented LAST, after all other fixes
  are done. The stricter biome/TS rules will fail until the code fixes are in place.

  Recommended order:
  1. Fix 01 — Hono RPC client (eliminates as any — biggest impact)
  2. Fix 04 — Markdown renderer (quick win, independent)
  3. Fix 05 — API robustness (admin deletes, slugs, consistent routers)
  4. Fix 06 — Logging and cleanup (pino logger, dedup constants)
  5. Fix 02 — Rate limiting (security)
  6. Fix 03 — MCP transport (critical but complex)
  7. Fix 07 — Tooling guardrails (LAST — tightens rules after code is clean)

  ## Hard rules

  1. NEVER commit until a fix fully passes all checks
  2. NEVER read .env files
  3. If stuck on something for more than 2 attempts, leave a TODO comment and move on
  4. Run all checks from the project root directory (/Users/hugoborsoni/Code/blueprints)
  5. Keep each fix focused — don't mix changes from different fix specs
  6. After Fix 07, there should be ZERO biome-ignore comments for noExplicitAny in source files"
  --max-iterations 50 --completion-promise "ALL_FIXES_APPLIED"
```
