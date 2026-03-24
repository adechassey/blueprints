import chalk from 'chalk';
import type { Command } from 'commander';
import { apiFetch } from '../lib/api.js';

export function registerInfoCommand(program: Command) {
	program
		.command('info <slug>')
		.description('Show full details of a blueprint')
		.action(async (slug: string) => {
			try {
				// biome-ignore lint/suspicious/noExplicitAny: API response shape
				const blueprint = (await apiFetch(`/blueprints/${slug}`)) as any;

				console.log(chalk.bold.underline(blueprint.name));
				console.log();
				if (blueprint.description) console.log(`  ${blueprint.description}`);
				if (blueprint.usage) console.log(`  ${chalk.gray(`Usage: ${blueprint.usage}`)}`);
				console.log();
				console.log(`  Stack:     ${chalk.cyan(blueprint.stack)}`);
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
