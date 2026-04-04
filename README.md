# Blueprints

A blueprint registry and discovery platform where developers can publish, browse, search, and download annotated code patterns.

## CLI Installation

**Requirements:** Node.js 22+

### Quick install (macOS / Linux)

```sh
curl -fsSL https://raw.githubusercontent.com/adechassey/blueprints/main/install.sh | sh
```

To update, run the same command again.

### Manual install

Download the latest release for your platform from the [releases page](https://github.com/adechassey/blueprints/releases), extract it, and move the binary to a directory in your `PATH`:

```sh
# macOS (Apple Silicon)
curl -fsSL https://github.com/adechassey/blueprints/releases/latest/download/theodo-blueprints-darwin-arm64.tar.gz | tar xz
sudo mv theodo-blueprints /usr/local/bin/

# macOS (Intel)
curl -fsSL https://github.com/adechassey/blueprints/releases/latest/download/theodo-blueprints-darwin-x64.tar.gz | tar xz
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

This installs to `%LOCALAPPDATA%\theodo-blueprints` and adds it to your `PATH`. To update, run the same command again.

## CLI Usage

```sh
# Authenticate
theodo-blueprints auth login

# Search blueprints
theodo-blueprints search "authentication middleware"

# List all blueprints
theodo-blueprints list

# Pull a blueprint
theodo-blueprints pull <slug> -o output.md

# Push a blueprint
theodo-blueprints push blueprint.md --project my-project

# Manage projects
theodo-blueprints projects list
theodo-blueprints projects join <slug>
theodo-blueprints projects members <slug>
```

## Development

```sh
pnpm install
pnpm dev     # Start all dev servers
pnpm build   # Build all packages
pnpm test    # Run all tests
```

See [CLAUDE.md](./CLAUDE.md) for project conventions and architecture details.
