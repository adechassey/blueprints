# <img src="webapp/public/logo.svg" width="40" align="top" alt=""/> Blueprints

A blueprint registry and discovery platform where developers can publish, browse, search, and download annotated code patterns.

## CLI Installation

**Requirements:** Node.js 22+

### Quick install (macOS / Linux)

```sh
curl -fsSL https://raw.githubusercontent.com/adechassey/blueprints/main/install.sh | sh
```

To update, run `theodo-blueprints update` (or the same command again).

### Manual install

Download the latest release for your platform from the [releases page](https://github.com/adechassey/blueprints/releases), extract it, and move the binary to a directory in your `PATH`:

```sh
# macOS (Apple Silicon and Intel — the bundle is a platform-agnostic Node.js script)
curl -fsSL https://github.com/adechassey/blueprints/releases/latest/download/theodo-blueprints-darwin-arm64.tar.gz | tar xz
sudo mv theodo-blueprints /usr/local/bin/

# Linux (x64)
curl -fsSL https://github.com/adechassey/blueprints/releases/latest/download/theodo-blueprints-linux-x64.tar.gz | tar xz
sudo mv theodo-blueprints /usr/local/bin/

# Linux (arm64)
curl -fsSL https://github.com/adechassey/blueprints/releases/latest/download/theodo-blueprints-linux-arm64.tar.gz | tar xz
sudo mv theodo-blueprints /usr/local/bin/
```

### Quick install (Windows)

```powershell
irm https://raw.githubusercontent.com/adechassey/blueprints/main/install.ps1 | iex
```

This installs to `%LOCALAPPDATA%\theodo-blueprints` and adds it to your `PATH`. To update, run `theodo-blueprints update` (or the same command again).

### Staying up to date

Once a day, the CLI checks GitHub for a newer release and prints a notice after the command when one exists. The check is skipped in CI, for dev builds, when the output is not a terminal, or when `THEODO_BLUEPRINTS_NO_UPDATE_CHECK=1` is set. `theodo-blueprints update --check` reports the latest release without installing it.

## CLI Usage

```sh
# Authenticate
theodo-blueprints auth login

# Search blueprints
theodo-blueprints search "authentication middleware"

# List all blueprints
theodo-blueprints list

# Pull a blueprint (slugs are unique per project: --project scopes the lookup)
theodo-blueprints pull <slug> --project my-project -o output.md

# Push a blueprint
theodo-blueprints push blueprint.md --project my-project

# Sync blueprints from a blueprint skill TSV index (docs/blueprints.tsv)
theodo-blueprints sync --repo owner/repo --project my-project

# Manage projects
theodo-blueprints projects list
theodo-blueprints projects create <slug> --name "My Project"
theodo-blueprints projects join <slug>
theodo-blueprints projects members <slug>

# Update the CLI to the latest release
theodo-blueprints update
```

## Publishing the CLI to npm (future)

The CLI is not published to npm yet. When it's time:

1. Bump the version in `cli/package.json`.
2. Build the TypeScript output:

   ```sh
   pnpm --filter @theodo-blueprints/cli build
   ```

3. Publish from the `cli/` directory (the `bin` field already points to `./dist/index.js`):

   ```sh
   cd cli && npm publish --access public
   ```

4. Users then install globally: `npm install -g @theodo-blueprints/cli`.

## Syncing from the blueprint skill

If your repo uses the [`blueprint` skill](https://github.com/theodo-group/future-of-software) (`@Blueprint` annotations), you can publish its whole catalog to the registry in one command. Generate the TSV index with the skill (`bash .claude/skills/blueprint/index.sh`), then:

```sh
theodo-blueprints sync [docs/blueprints.tsv] --repo owner/repo [--project my-project] [--techno Next.js,Kysely] [--layer layer] [--dry-run]
```

- Each `@Blueprint` becomes a registry blueprint whose slug is the pattern-id, so re-running `sync` updates in place (never duplicates).
- Slugs are unique **per project**, not globally: pass `--project` so the lookup is scoped to your namespace and your `form-field` never collides with another project's. An unscoped sync skips (and reports) any pattern-id that already belongs to a project instead of overwriting it.
- The layer is inferred from the declared globs (`*.controller.ts` → `controller`, `/hooks/` → `hook`, `.tsx` → `component`, …); `--layer` overrides the fallback.
- The exemplar excerpt is embedded in the content, and `source` records `--repo:path:line` for traceability.

Setting the skill up in a project from scratch — install, annotations, index, hooks, first sync — is covered in [How to install the `blueprint` skill](./docs/how-to/install-the-blueprint-skill.md).

## Development

```sh
pnpm install
pnpm dev     # Start all dev servers
pnpm build   # Build all packages
pnpm test    # Run all tests
```

See [CLAUDE.md](./CLAUDE.md) for project conventions and architecture details.
