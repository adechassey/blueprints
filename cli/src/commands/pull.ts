import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';

export function registerPullCommand(program: Command) {
	program
		.command('pull <slug>')
		.description('Pull a blueprint from the registry')
		.option('-o, --output <path>', 'Save to file instead of stdout')
		.option('--version <n>', 'Pull specific version (default: latest)')
		.option('--project <name>', 'Project scope')
		.action(async (slug: string, opts: { output?: string; version?: string; project?: string }) => {
			try {
				const client = createApiClient();
				const res = await client.api.blueprints[':id'].$get({ param: { id: slug } });
				const blueprint = await unwrapResponse(res);

				if ('error' in blueprint) {
					console.error(chalk.red(`Error: ${blueprint.error}`));
					process.exit(1);
				}

				let content: string;
				if (opts.version) {
					const versionRes = await client.api.blueprints[':id'].versions[':version'].$get({
						param: { id: blueprint.id, version: opts.version },
					});
					const version = await unwrapResponse(versionRes);
					if ('error' in version) {
						console.error(chalk.red(`Error: ${version.error}`));
						process.exit(1);
					}
					content = version.content;
				} else {
					content = blueprint.currentVersion?.content ?? '';
				}

				// Increment download count
				client.api.blueprints[':id'].download
					.$post({ param: { id: blueprint.id } })
					.catch((err: Error) => {
						console.warn('Download tracking failed:', err.message);
					});

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
