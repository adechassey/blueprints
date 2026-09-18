import { createFileRoute, Link } from '@tanstack/react-router';
import { ExternalLink, Sparkles } from 'lucide-react';
import { BlockLabel, Callout, CodeBlock, Section } from '../components/Guide.js';
import { Badge } from '../components/ui/badge.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/skill')({
	component: SkillPage,
});

const SKILL_REPO_URL = 'https://github.com/theodo-group/future-of-software';
const SKILL_SOURCE_URL = `${SKILL_REPO_URL}/tree/main/skills/blueprint`;

const INSTALL = `# From your project root
gh api repos/theodo-group/future-of-software/contents/install.sh \\
  -H Accept:application/vnd.github.raw | bash -s -- skills/blueprint

# Pin a release instead of tracking main
FOS_REF=<tag> gh api repos/theodo-group/future-of-software/contents/install.sh \\
  -H Accept:application/vnd.github.raw | bash -s -- skills/blueprint

# No arguments opens an fzf picker over every skill, agent and bundle`;

const ANNOTATE = `// @Blueprint controller-create
// @BlueprintName Create Endpoint
// @BlueprintUsage Use for POST endpoints that create a resource with DTO validation
// @BlueprintDescription POST controller with nested DTO body, auth guard and plainToInstance response
// @BlueprintGlobs src/**/*.controller.ts
export const create = ...

// Every other file implementing the pattern gets a one-liner
// @FollowsBlueprint controller-create
export const createArea = ...`;

const INDEX = `# In Claude Code
/blueprint index

# Or directly: output path, then the directories to scan
bash .claude/skills/blueprint/index.sh docs/blueprints.md src

# Check a glob resolves before committing it (exit 1 = no match)
sh .claude/skills/blueprint/matcher.sh --path src/orders/orders.controller.ts`;

const HOOKS = `{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "sh .claude/skills/blueprint/hooks/inject-index.sh" }] }
    ],
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "sh .claude/skills/blueprint/hooks/check-write.sh" }]
      },
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "sh .claude/skills/blueprint/hooks/snapshot-bash.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "sh .claude/skills/blueprint/hooks/check-bash.sh" }]
      }
    ]
  }
}`;

const PUBLISH = `# Run from the repo root: the index records exemplar paths relative to it
theodo-blueprints auth login
theodo-blueprints projects create my-project --name "My Project"

# Always preview first: it prints the layer and technologies inferred per row
theodo-blueprints sync docs/blueprints.tsv --project my-project --repo owner/repo --dry-run

theodo-blueprints sync docs/blueprints.tsv --project my-project --repo owner/repo`;

// Globs stay in constants: `**/` written as JSX text reads as a comment opener.
const SCOPED_GLOB = 'target/src/**/*.controller.ts';
const BARE_GLOB = 'src/**/*.controller.ts';

/** One gotcha: a short label and the consequence of getting it wrong. */
function Gotcha({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<li>
			<span className="font-medium text-on-surface">{label}</span> {children}
		</li>
	);
}

function InlineCode({ children }: { children: React.ReactNode }) {
	return (
		<code className="rounded bg-surface-variant px-1.5 py-0.5 font-mono text-xs">{children}</code>
	);
}

function SkillPage() {
	return (
		<div className="mx-auto max-w-3xl space-y-12">
			<header className="space-y-3">
				<div className="flex flex-wrap items-center gap-3">
					<span className="rounded-lg bg-surface-container-low p-2">
						<Sparkles className="h-6 w-6 text-primary" />
					</span>
					<h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
						{m.skill_title()}
					</h1>
					<Badge variant="primary">{m.skill_requirement()}</Badge>
				</div>
				<p className="text-on-surface-variant">{m.skill_intro()}</p>
				<a
					href={SKILL_SOURCE_URL}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1 text-primary text-sm"
				>
					{m.skill_source_link()}
					<ExternalLink className="h-3.5 w-3.5" />
				</a>
			</header>

			<Section step={1} title={m.skill_install_title()} description={m.skill_install_description()}>
				<CodeBlock code={INSTALL} header={<BlockLabel>Terminal</BlockLabel>} />
				<Callout>
					<ul className="space-y-1.5">
						<Gotcha label={m.skill_install_gotcha_pin_label()}>
							{m.skill_install_gotcha_pin()}
						</Gotcha>
						<Gotcha label={m.skill_install_gotcha_readme_label()}>
							{m.skill_install_gotcha_readme()}{' '}
							<a href={SKILL_SOURCE_URL} target="_blank" rel="noreferrer" className="text-primary">
								{m.skill_install_gotcha_readme_link()}
							</a>
							.
						</Gotcha>
					</ul>
				</Callout>
				<p className="text-on-surface-variant text-sm">
					{m.skill_install_commit()} <InlineCode>.claude/skills/blueprint/</InlineCode>{' '}
					{m.skill_install_commit_and()} <InlineCode>.claude/future-of-software.lock</InlineCode>.
				</p>
			</Section>

			<Section
				step={2}
				title={m.skill_annotate_title()}
				description={m.skill_annotate_description()}
			>
				<CodeBlock
					code={ANNOTATE}
					language="plain"
					header={<BlockLabel>src/areas/area.controller.ts</BlockLabel>}
				/>
				<Callout>
					<p className="mb-2 font-medium text-on-surface">{m.skill_annotate_gotchas_title()}</p>
					<ul className="space-y-1.5">
						<Gotcha label={m.skill_annotate_gotcha_comment_label()}>
							{m.skill_annotate_gotcha_comment()}
						</Gotcha>
						<Gotcha label={m.skill_annotate_gotcha_glob_label()}>
							{m.skill_annotate_gotcha_glob()} <InlineCode>{SCOPED_GLOB}</InlineCode>,{' '}
							{m.skill_annotate_gotcha_glob_never()} <InlineCode>{BARE_GLOB}</InlineCode>.
						</Gotcha>
						<Gotcha label={m.skill_annotate_gotcha_id_label()}>
							{m.skill_annotate_gotcha_id()}
						</Gotcha>
					</ul>
				</Callout>
			</Section>

			<Section step={3} title={m.skill_index_title()} description={m.skill_index_description()}>
				<CodeBlock code={INDEX} header={<BlockLabel>Terminal</BlockLabel>} />
				<p className="text-on-surface-variant text-sm">
					{m.skill_index_commit_both()} <InlineCode>docs/blueprints.md</InlineCode>{' '}
					{m.skill_index_commit_and()} <InlineCode>docs/blueprints.tsv</InlineCode>{' '}
					{m.skill_index_commit_why()}
				</p>
			</Section>

			<Section
				step={4}
				title={m.skill_hooks_title()}
				description={m.skill_hooks_description()}
				badge={<Badge>{m.skill_hooks_badge()}</Badge>}
			>
				<CodeBlock
					code={HOOKS}
					language="plain"
					header={<BlockLabel>.claude/settings.json</BlockLabel>}
				/>
				<p className="text-on-surface-variant text-sm">{m.skill_hooks_behaviour()}</p>
				<Callout>
					{m.skill_hooks_telemetry()}{' '}
					<InlineCode>.claude/telemetry/&lt;git-user&gt;.jsonl</InlineCode>.{' '}
					{m.skill_hooks_telemetry_merge()}{' '}
					<InlineCode>.claude/telemetry/*.jsonl merge=union</InlineCode>{' '}
					{m.skill_hooks_telemetry_to()} <InlineCode>.gitattributes</InlineCode>.
				</Callout>
			</Section>

			<Section step={5} title={m.skill_publish_title()} description={m.skill_publish_description()}>
				<CodeBlock code={PUBLISH} header={<BlockLabel>Terminal</BlockLabel>} />
				<ul className="list-disc space-y-1.5 pl-5 text-on-surface-variant text-sm">
					<li>{m.skill_publish_slug()}</li>
					<li>{m.skill_publish_scope()}</li>
					<li>{m.skill_publish_techno()}</li>
				</ul>
				<Card>
					<CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-on-surface-variant text-sm">{m.skill_publish_cli_hint()}</p>
						<Link to="/cli" className="shrink-0 no-underline">
							<Button variant="secondary" size="sm" className="w-full sm:w-auto">
								{m.skill_publish_cli_cta()}
							</Button>
						</Link>
					</CardContent>
				</Card>
			</Section>

			<Section title={m.skill_update_title()} description={m.skill_update_description()}>
				<p className="text-on-surface-variant text-sm">{m.skill_update_body()}</p>
			</Section>
		</div>
	);
}
