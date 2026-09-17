import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';

export function registerInfoCommand(program: Command) {
	program
		.command('info <slug>')
		.description('Show full details of a blueprint')
		.option('--project <slug>', 'Project that scopes the slug (slugs are unique per project)')
		.action(async (slug: string, opts: { project?: string }) => {
			try {
				const client = createApiClient();
				const res = await client.api.blueprints[':id'].$get({
					param: { id: slug },
					query: opts.project === undefined ? {} : { project: opts.project },
				});
				const blueprint = await unwrapResponse(res);

				if ('error' in blueprint) {
					console.error(chalk.red(`Error: ${blueprint.error}`));
					process.exit(1);
				}

				console.log(chalk.bold.underline(blueprint.name));
				console.log();
				if (blueprint.description) console.log(`  ${blueprint.description}`);
				if (blueprint.usage) console.log(`  ${chalk.gray(`Usage: ${blueprint.usage}`)}`);
				console.log();
				console.log(`  Layer:     ${chalk.cyan(blueprint.layer)}`);
				if (blueprint.technologies?.length) {
					console.log(
						`  Techs:     ${chalk.cyan(blueprint.technologies.map((t) => t.name).join(', '))}`,
					);
				}
				console.log(`  Layer:     ${blueprint.layer}`);
				console.log(`  Author:    ${blueprint.author?.name || 'Unknown'}`);
				console.log(`  Downloads: ${blueprint.downloadCount}`);
				console.log(`  Created:   ${new Date(blueprint.createdAt).toLocaleDateString()}`);

				if (blueprint.tags?.length) {
					console.log(
						`  Tags:      ${blueprint.tags.map((t: { name: string }) => t.name).join(', ')}`,
					);
				}

				if (blueprint.currentVersion) {
					console.log();
					console.log(chalk.gray('--- Content ---'));
					console.log(blueprint.currentVersion.content);
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				console.error(chalk.red(`Error: ${msg}`));
				process.exit(1);
			}
		});
}
