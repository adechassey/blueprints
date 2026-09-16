import { createFileRoute, Link } from '@tanstack/react-router';
import { Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/cli')({
	component: CliPage,
});

function CodeBlock({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="group relative">
			<pre className="overflow-x-auto rounded-lg bg-surface-variant p-4 pr-12 text-sm">
				<code>{code}</code>
			</pre>
			<Button
				variant="ghost"
				size="icon"
				aria-label="Copy"
				onClick={handleCopy}
				className="absolute right-2 top-2 opacity-60 transition-opacity group-hover:opacity-100"
			>
				{copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
			</Button>
		</div>
	);
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3">
			<h2 className="font-semibold text-xl">{title}</h2>
			<p className="text-on-surface-variant text-sm">{description}</p>
			{children}
		</section>
	);
}

const INSTALL_MACOS = `curl -fsSL https://raw.githubusercontent.com/adechassey/blueprints/main/install.sh | sh`;
const INSTALL_WINDOWS = `irm https://raw.githubusercontent.com/adechassey/blueprints/main/install.ps1 | iex`;
const USAGE = `# Search blueprints with natural language
theodo-blueprints search "authentication middleware"

# List blueprints (optional filters)
theodo-blueprints list --stack nestjs --tag hooks

# Pull a blueprint into a file
theodo-blueprints pull <slug> -o output.md

# Push a blueprint
theodo-blueprints push blueprint.md --project my-project

# Sync a whole @Blueprint catalog from its TSV index (see below)
theodo-blueprints sync --repo owner/repo --project my-project

# Manage projects
theodo-blueprints projects list
theodo-blueprints projects join <slug>`;

const SYNC = `# 1. Generate the TSV index with the blueprint skill (docs/blueprints.tsv)
bash .claude/skills/blueprint/index.sh

# 2. Preview what would be published
theodo-blueprints sync --repo owner/repo --project my-project --dry-run

# 3. Publish the catalog (re-run any time: blueprints update in place)
theodo-blueprints sync --repo owner/repo --project my-project

# Optional: --stack <stack> (default: server), --layer <layer> fallback`;

function CliPage() {
	return (
		<div className="mx-auto max-w-3xl space-y-10">
			<header className="space-y-3">
				<div className="flex items-center gap-3">
					<span className="rounded-lg bg-surface-container-low p-2">
						<Terminal className="h-6 w-6 text-primary" />
					</span>
					<h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
						{m.cli_title()}
					</h1>
				</div>
				<p className="text-on-surface-variant">{m.cli_intro()}</p>
				<p className="text-outline text-xs">{m.cli_requirement()}</p>
			</header>

			<Section title={m.cli_install_title()} description={m.cli_install_description()}>
				<div className="space-y-3">
					<div>
						<p className="mb-1.5 text-xs font-medium text-on-surface-variant uppercase">
							macOS / Linux
						</p>
						<CodeBlock code={INSTALL_MACOS} />
					</div>
					<div>
						<p className="mb-1.5 text-xs font-medium text-on-surface-variant uppercase">
							Windows (PowerShell)
						</p>
						<CodeBlock code={INSTALL_WINDOWS} />
					</div>
				</div>
			</Section>

			<Section title={m.cli_auth_title()} description={m.cli_auth_description()}>
				<CodeBlock code="theodo-blueprints auth login" />
				<Card>
					<CardContent className="flex items-center justify-between gap-4 py-4">
						<p className="text-on-surface-variant text-sm">
							Prefer a token? Generate one from your account and log in with{' '}
							<code className="rounded bg-surface-variant px-1.5 py-0.5 font-mono text-xs">
								auth login --token
							</code>
							.
						</p>
						<Link to="/cli-token" className="no-underline">
							<Button variant="secondary" size="sm">
								{m.cli_auth_cta()}
							</Button>
						</Link>
					</CardContent>
				</Card>
			</Section>

			<Section title={m.cli_usage_title()} description={m.cli_usage_description()}>
				<CodeBlock code={USAGE} />
			</Section>

			<Section title={m.cli_sync_title()} description={m.cli_sync_description()}>
				<CodeBlock code={SYNC} />
			</Section>
		</div>
	);
}
