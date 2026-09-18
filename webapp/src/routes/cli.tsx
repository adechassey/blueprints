import { createFileRoute, Link } from '@tanstack/react-router';
import { ExternalLink, Terminal } from 'lucide-react';
import { BlockLabel, CodeBlock, Section } from '../components/Guide.js';
import { Badge } from '../components/ui/badge.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/cli')({
	component: CliPage,
});

const REPO_URL = 'https://github.com/adechassey/blueprints';
const INSTALL_MACOS = `curl -fsSL https://raw.githubusercontent.com/adechassey/blueprints/main/install.sh | sh`;
const INSTALL_WINDOWS = `irm https://raw.githubusercontent.com/adechassey/blueprints/main/install.ps1 | iex`;
const SYNC = `# 1. Generate the TSV index with the blueprint skill (docs/blueprints.tsv)
bash .claude/skills/blueprint/index.sh

# 2. Preview what would be published
theodo-blueprints sync --repo owner/repo --project my-project --dry-run

# 3. Publish the catalog (re-run any time: blueprints update in place)
theodo-blueprints sync --repo owner/repo --project my-project

# Layers and technologies are inferred from each exemplar file
# Optional: --techno <names> adds technologies, --layer <layer> sets the fallback layer`;

const COMMANDS = [
	{
		name: 'search',
		description: m.cli_cmd_search,
		code: 'theodo-blueprints search "authentication middleware"',
	},
	{
		name: 'list',
		description: m.cli_cmd_list,
		code: 'theodo-blueprints list --techno react,hono --layer api',
	},
	{
		name: 'scaffold',
		description: m.cli_cmd_scaffold,
		code: 'theodo-blueprints scaffold <project> ./blueprints',
	},
	{
		name: 'fork',
		description: m.cli_cmd_fork,
		code: 'theodo-blueprints fork <slug> --from <project> --into <my-project>',
	},
	{
		name: 'pull',
		description: m.cli_cmd_pull,
		code: 'theodo-blueprints pull <slug> -o output.md',
	},
	{
		name: 'push',
		description: m.cli_cmd_push,
		code: 'theodo-blueprints push blueprint.md --project my-project',
	},
	{
		name: 'sync',
		description: m.cli_cmd_sync,
		code: 'theodo-blueprints sync --repo owner/repo --project my-project',
	},
	{
		name: 'projects',
		description: m.cli_cmd_projects,
		code: 'theodo-blueprints projects list\ntheodo-blueprints projects join <slug>',
	},
	{
		name: 'update',
		description: m.cli_cmd_update,
		code: 'theodo-blueprints update',
	},
];

function CliPage() {
	return (
		<div className="mx-auto max-w-3xl space-y-12">
			<header className="space-y-3">
				<div className="flex flex-wrap items-center gap-3">
					<span className="rounded-lg bg-surface-container-low p-2">
						<Terminal className="h-6 w-6 text-primary" />
					</span>
					<h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
						{m.cli_title()}
					</h1>
					<Badge variant="primary">{m.cli_requirement()}</Badge>
				</div>
				<p className="text-on-surface-variant">{m.cli_intro()}</p>
				<a
					href={`${REPO_URL}/releases`}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1 text-primary text-sm"
				>
					{m.cli_releases_link()}
					<ExternalLink className="h-3.5 w-3.5" />
				</a>
			</header>

			<Section step={1} title={m.cli_install_title()} description={m.cli_install_description()}>
				<div className="space-y-3">
					<CodeBlock code={INSTALL_MACOS} header={<BlockLabel>macOS / Linux</BlockLabel>} />
					<CodeBlock
						code={INSTALL_WINDOWS}
						header={<BlockLabel>Windows (PowerShell)</BlockLabel>}
					/>
				</div>
			</Section>

			<Section step={2} title={m.cli_auth_title()} description={m.cli_auth_description()}>
				<CodeBlock code="theodo-blueprints auth login" header={<BlockLabel>Terminal</BlockLabel>} />
				<Card>
					<CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-on-surface-variant text-sm">
							{m.cli_auth_token_hint()}{' '}
							<code className="whitespace-nowrap rounded bg-surface-variant px-1.5 py-0.5 font-mono text-xs">
								auth login --token
							</code>
							.
						</p>
						<Link to="/cli-token" className="shrink-0 no-underline">
							<Button variant="secondary" size="sm" className="w-full sm:w-auto">
								{m.cli_auth_cta()}
							</Button>
						</Link>
					</CardContent>
				</Card>
			</Section>

			<Section step={3} title={m.cli_usage_title()} description={m.cli_usage_description()}>
				<div className="space-y-3">
					{COMMANDS.map((command) => (
						<CodeBlock
							key={command.name}
							code={command.code}
							header={
								<>
									<span className="font-mono font-semibold text-on-surface">{command.name}</span>
									<span className="text-on-surface-variant">{command.description()}</span>
								</>
							}
						/>
					))}
				</div>
				<p className="text-on-surface-variant text-xs">
					{m.cli_usage_help()}{' '}
					<code className="rounded bg-surface-variant px-1.5 py-0.5 font-mono">
						theodo-blueprints &lt;command&gt; --help
					</code>
				</p>
			</Section>

			<Section
				title={m.cli_sync_title()}
				description={m.cli_sync_description()}
				badge={<Badge>{m.cli_sync_badge()}</Badge>}
			>
				<CodeBlock code={SYNC} header={<BlockLabel>Terminal</BlockLabel>} />
				<Card>
					<CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-on-surface-variant text-sm">{m.cli_sync_skill_hint()}</p>
						<Link to="/skill" className="shrink-0 no-underline">
							<Button variant="secondary" size="sm" className="w-full sm:w-auto">
								{m.cli_sync_skill_cta()}
							</Button>
						</Link>
					</CardContent>
				</Card>
			</Section>
		</div>
	);
}
