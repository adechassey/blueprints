import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import type { Command } from 'commander';
import { apiFetch } from '../lib/api.js';

export function registerPullCommand(program: Command) {
	program
		.command('pull <slug>')
		.description('Pull a blueprint from the registry')
		.option('-o, --output <path>', 'Save to file instead of stdout')
		.option('--version <n>', 'Pull specific version (default: latest)')
		.option('--project <name>', 'Project scope')
		.action(async (slug: string, opts: { output?: string; version?: string; project?: string }) => {
			try {
				const params = new URLSearchParams();
				if (opts.project) params.set('project', opts.project);
				const query = params.toString();
				// biome-ignore lint/suspicious/noExplicitAny: API response shape
				const blueprint = (await apiFetch(`/blueprints/${slug}${query ? `?${query}` : ''}`)) as any;

				let content: string;
				if (opts.version) {
					const version = (await apiFetch(
						`/blueprints/${blueprint.id}/versions/${opts.version}`,
					)) as { content: string };
					content = version.content;
				} else {
					content = blueprint.currentVersion?.content ?? '';
				}

				// Increment download count
				apiFetch(`/blueprints/${blueprint.id}/download`, { method: 'POST' }).catch(() => {});

				if (opts.output) {
					writeFileSync(opts.output, content);
					console.error(chalk.green(`✓ Saved to ${opts.output}`));
				} else {
					process.stdout.write(content);
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				console.error(chalk.red(`Error: ${msg}`));
				process.exit(1);
			}
		});
}
