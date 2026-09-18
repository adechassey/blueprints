# How to install the `blueprint` skill in a project

The [`blueprint` skill](https://github.com/theodo-group/future-of-software/tree/main/skills/blueprint)
is the annotation side of this registry: it marks canonical code patterns in a
codebase with `@Blueprint` comments, builds an index of them, and — via its hooks —
reminds Claude Code to reuse them. Its TSV index is what `theodo-blueprints sync`
publishes here.

This guide covers installing it into a **consuming project** (any repo whose
patterns you want to publish), from annotation to a synced catalogue.

## Requirements

- [`gh`](https://cli.github.com) authenticated against an account with access to
  `theodo-group/future-of-software` (`gh auth login`)
- Node.js — only to write the provenance lockfile; the skill itself is pure POSIX
  shell (no Node, no `jq`)
- `fzf` only if you want the interactive picker

## 1. Install the skill

From the project root:

```sh
gh api repos/theodo-group/future-of-software/contents/install.sh \
  -H Accept:application/vnd.github.raw | bash -s -- skills/blueprint
```

This copies the skill to `.claude/skills/blueprint/` and records where it came
from in `.claude/future-of-software.lock`.

Two things to know about that command:

- **It installs from `main`, unpinned.** A bare bundle name (`bash -s -- quality`)
  resolves to that bundle's latest release tag; an explicit `skills/blueprint`
  does not. Pin it yourself with `FOS_REF=<tag> gh api … | bash -s -- skills/blueprint`,
  or install the `quality` bundle, which contains the skill among others.
- **The installer strips `README.md` from the installed copy.** `SKILL.md` ships
  with the normative annotation rules; the long-form reference stays
  [in the source repo](https://github.com/theodo-group/future-of-software/tree/main/skills/blueprint).

The installer prompts for one placeholder, `INDEX_PATH` (default
`docs/blueprints.md`). Accept the default unless the project already keeps its
docs elsewhere — the hooks and the CLI both assume the TSV twin sits at
`docs/blueprints.tsv`.

Alternatives: run the installer with no arguments for an `fzf` picker over every
skill, agent and bundle; or, from a local clone, run `/path/to/install.sh
skills/blueprint` directly.

Commit `.claude/skills/blueprint/` and the lockfile — pattern consistency is a
team property, and a fresh clone should get the skill and its hooks working.

## 2. Annotate a first exemplar

An exemplar is the canonical example of a pattern. Annotate it with a comment
block directly above the declaration, in the language's **line**-comment syntax:

```typescript
// @Blueprint controller-create
// @BlueprintName Create Endpoint
// @BlueprintUsage Use for POST endpoints that create a resource with DTO validation
// @BlueprintDescription POST controller with nested DTO body, auth guard, and plainToInstance response
// @BlueprintGlobs src/**/*.controller.ts
export const create = ...
```

Implementations of the pattern get a one-liner instead:

```typescript
// @FollowsBlueprint controller-create
export const createArea = ...
```

Rules that bite in practice:

- **Never put `@BlueprintGlobs` in a block comment.** A glob containing `**/`
  embeds `*/`, which closes the comment early and breaks the file.
- **Globs are relative to the repo root**, i.e. the directory Claude Code runs
  in. In a monorepo the glob must include the package: `target/src/**/*.controller.ts`,
  never `src/**/*.controller.ts` — a bare `src/…` never matches, and the hooks
  then stay silent forever.
- **Pattern ids are kebab-case**, category-prefixed (`controller-create`,
  `repository-search`). Anything else is silently dropped from the index.

The full rules live in `.claude/skills/blueprint/SKILL.md`, under "Annotation
conventions".

## 3. Build the index and commit it

In Claude Code:

```
/blueprint index
```

or directly, passing the output path and the directories to scan:

```sh
bash .claude/skills/blueprint/index.sh docs/blueprints.md src
```

This writes two files: `docs/blueprints.md` (for humans) and
`docs/blueprints.tsv` (the machine-readable contract the hooks, `matcher.sh` and
`theodo-blueprints sync` all consume). **Commit both.**

Check a glob resolves the way you expect before committing it:

```sh
sh .claude/skills/blueprint/matcher.sh --path src/orders/orders.controller.ts
```

Exit code `1` means no match — that is the silent case the hooks rely on, so an
unexpected `1` is usually a glob missing its package prefix.

## 4. Wire up the hooks (recommended)

Without hooks the skill is a catalogue; with them, Claude Code reuses blueprints
by construction. Add to the project's committed `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "sh .claude/skills/blueprint/hooks/inject-index.sh" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": "sh .claude/skills/blueprint/hooks/check-write.sh" }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "sh .claude/skills/blueprint/hooks/snapshot-bash.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "sh .claude/skills/blueprint/hooks/check-bash.sh" }
        ]
      }
    ]
  }
}
```

What they do: the `SessionStart` hook injects the compact index once per session
boot (silent above 150 entries); the `Write` and `Bash` pairs notice a **new**
file matching a blueprint's globs with no `@FollowsBlueprint` and remind Claude
which blueprint applies. Nothing is ever blocked, and existing files are never
checked, so brownfield work stays noise-free.

If the index lives somewhere other than `docs/blueprints.tsv`, set
`BLUEPRINT_INDEX` in the hook commands.

The check hooks append one JSONL line per event to
`.claude/telemetry/<git-user>.jsonl`. That file is committed, so it rides along
in your commits; add `.claude/telemetry/*.jsonl merge=union` to `.gitattributes`
to make concurrent appends merge cleanly.

## 5. Publish the catalogue to the registry

Authenticate the CLI, make sure the target project exists, then sync **from the
repo root** — the TSV records exemplar locations relative to the current
directory, and `sync` reads those files to classify each blueprint:

```sh
theodo-blueprints auth login
theodo-blueprints projects create my-project --name "My Project"   # once

theodo-blueprints sync docs/blueprints.tsv \
  --project my-project --repo owner/repo --dry-run
```

Always dry-run first: it prints the layer and technologies inferred for each row,
flagging the ones that fell back to a default. Drop `--dry-run` to publish.

- Each `@Blueprint` becomes a blueprint whose slug is the pattern-id, so
  re-running `sync` updates in place and only creates a version when the content
  changed.
- Slugs are unique per project, so `--project` scopes the lookup — your
  `form-field` never collides with another project's.
- Technologies are detected from the exemplar's imports. When a wrapper hides the
  real dependency (a `db/client` wrapper over Kysely, an ORM hiding SQL Server),
  split the TSV by path and pass `--techno` per subset.
- `--layer` overrides the fallback for exemplars whose path and globs match no
  convention.

See the [README](../../README.md#syncing-from-the-blueprint-skill) for the sync
flags in full.

## Keeping the skill up to date

Re-run the install command; it prompts before overwriting `.claude/skills/blueprint/`
and refreshes the entry in `.claude/future-of-software.lock`. The lockfile stores
a hash of the installed files, so a diff against a release tells you whether the
project has drifted locally.
