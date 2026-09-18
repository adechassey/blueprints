import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';
import { getConfig } from '../lib/config.js';

export function registerForkCommand(program: Command) {
	program
		.command('fork <slug>')
		.description("Copy another project's blueprint into yours, as your own blueprint")
		.option('--from <project>', 'Project that owns the blueprint (scopes the slug)')
		.option('--into <project>', 'Project the fork belongs to (defaults to the config default)')
		.action(async (slug: string, opts: { from?: string; into?: string }) => {
			try {
				const client = createApiClient();
				const config = getConfig();

				const target = opts.into ?? config.defaultProject;
				if (!target) {
					console.error(
						chalk.red('✗ No target project: pass --into <slug> or set a default in the config'),
					);
					process.exit(1);
				}

				const targetProject = await unwrapResponse(
					await client.api.projects[':slug'].$get({ param: { slug: target } }),
				);
				if ('error' in targetProject) {
					console.error(chalk.red(`✗ Project not found: ${target}`));
					process.exit(1);
				}

				const fork = await unwrapResponse(
					await client.api.blueprints[':id'].fork.$post({
						param: { id: slug },
						query: opts.from === undefined ? {} : { project: opts.from },
						json: { projectId: targetProject.id },
					}),
				);

				if ('error' in fork) {
					console.error(chalk.red(`Error: ${fork.error}`));
					process.exit(1);
				}

				console.log(
					chalk.green(`✓ Forked into ${target}: ${fork.name} (${fork.slug}) v1`),
					`\n${chalk.gray(`  ${config.server}/blueprints/${fork.id}`)}`,
					`\n${chalk.gray('  It is yours now: edit it and push it back with the CLI.')}`,
				);
			} catch (err) {
				console.error(chalk.red(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`));
				process.exit(1);
			}
		});
}
