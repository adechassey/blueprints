# Ralph Loop Prompt

Copy everything below the `---` line and pass it to `/ralph-loop`.

**Suggested command:**
```
/ralph-loop "<paste prompt below>" --max-iterations 100 --completion-promise "ALL_PHASES_VALIDATED"
```

---

You are implementing the Blueprints Server project, phase by phase (6 phases total). Each phase has a PRD in `docs/features/blueprint-server/phase-{N}-*/prd.md`.

## Before your first iteration

Read these files to understand the project:
- `CLAUDE.md`
- `docs/features/blueprint-server/architecture.md`

## Your workflow (every iteration)

### 1. Find the current phase

Run `pnpm tsx scripts/current-phase.ts`. It outputs JSON telling you what to do:

- `{ "done": false, "phase": "1", "name": "foundation", "folder": "phase-1-foundation", "hasSpec": false, "prdPath": "...", "specPath": "..." }` → Work on this phase.
- `{ "done": true }` → All phases complete. Output `<promise>ALL_PHASES_VALIDATED</promise>` and stop.

### 2. If no spec exists (`hasSpec: false`)

Read the PRD at the `prdPath` from the script output. Then create a spec at the `specPath`. The spec must:
- Translate every user story and functional requirement from the PRD into concrete implementation tasks
- List exact file paths to create or modify
- Define function signatures and types for key exports
- Define test cases for each testable requirement
- Be detailed enough that another developer could implement it without reading the PRD

After writing the spec, STOP this iteration. Implementation starts in the next iteration.

### 3. If spec exists (`hasSpec: true`) — Implement

Read the PRD and spec. Work through the spec methodically, one functional requirement at a time. After completing each FR:
- Run `pnpm check && pnpm check-types` to catch issues early
- Run `pnpm test` if you've added or modified tests
- Fix any errors before moving to the next FR

### 4. Validate

When you believe the entire spec is implemented, spawn the `phase-validator` agent:

```
Agent(
  subagent_type="general-purpose",
  description="Validate phase {N}",
  prompt="You are the phase-validator agent. Read your full instructions and output format at .claude/agents/phase-validator.md. Execute all steps described there. The current phase number is {N}."
)
```

### 5. Handle validation result

**If VALIDATED:**
- Stage all changes for this phase (be specific with `git add`, avoid .env files)
- Commit with: `feat({phase-name}): {short description of what was built}`
  - Use the phase name as scope (foundation, core, search, social, cli-mcp, polish)
  - Add `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
- Continue to the next iteration (which will pick up the next pending phase)

**If FAILED:**
- Read the failure report carefully
- Fix each failing criterion
- Do NOT re-run validation until all issues are addressed
- After fixes, run `pnpm check && pnpm check-types && pnpm test` yourself first
- Then spawn the validation agent again

## Hard rules

1. **NEVER run `scripts/validate-phase.ts` yourself.** Only the validation agent may run it.
2. **NEVER edit `tracker.json` yourself.** Only the validation script writes to it.
3. **NEVER commit until a phase is validated.** No intermediate commits, no fixups.
4. **NEVER read .env files.** Use .env.example for reference.
5. **ALWAYS run migrations** after editing Drizzle schema: `drizzle-kit generate` then apply migrations. Migrations must be applied before tests.
6. Read `CLAUDE.md` at the start. Follow all conventions listed there.
7. If stuck on something for more than 2 attempts, leave a `TODO:` comment in the code with a clear description and move on to the next task.
8. Prefer small, focused changes. If a phase has many FRs, implement them one at a time.
