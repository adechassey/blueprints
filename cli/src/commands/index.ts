import { writeFileSync } from 'node:fs';
import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';

export function registerIndexCommand(program: Command) {
	program
		.command('index <project-slug>')
		.description('Generate a blueprint index for a project')
		.option('-o, --output <path>', 'Save to file instead of stdout')
		.action(async (slug: string, opts: { output?: string }) => {
			try {
				const client = createApiClient();
				const res = await client.api.projects[':slug'].index.$get({
					param: { slug },
				});
				const result = await unwrapResponse(res);

				if ('error' in result) {
					console.error(chalk.red(`Error: ${result.error}`));
					process.exit(1);
				}

				if (opts.output) {
					writeFileSync(opts.output, result.markdown);
					console.error(
						chalk.green(
							`✓ Saved index for "${result.project}" (${result.count} blueprints) to ${opts.output}`,
						),
					);
				} else {
					process.stdout.write(result.markdown);
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				console.error(chalk.red(`Error: ${msg}`));
				process.exit(1);
			}
		});
}
