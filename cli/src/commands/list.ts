import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';

export function registerListCommand(program: Command) {
	program
		.command('list')
		.description('List blueprints')
		.option('--techno <slugs>', 'Filter by technology slugs (comma-separated, any-match)')
		.option('--layer <layer>', 'Filter by layer')
		.option('--tag <tag>', 'Filter by tag')
		.option('--project <slug>', 'Filter by project slug')
		.option('--author <author>', 'Filter by author ID')
		.action(
			async (opts: {
				techno?: string;
				layer?: string;
				tag?: string;
				project?: string;
				author?: string;
			}) => {
				try {
					const client = createApiClient();
					const queryParams: Record<string, string> = {};
					if (opts.techno) queryParams.techno = opts.techno;
					if (opts.layer) queryParams.layer = opts.layer;
					if (opts.tag) queryParams.tag = opts.tag;
					if (opts.project) queryParams.project = opts.project;
					if (opts.author) queryParams.authorId = opts.author;

					const res = await client.api.blueprints.$get({ query: queryParams });
					const result = await unwrapResponse(res);

					if (result.items.length === 0) {
						console.log(chalk.yellow('No blueprints found.'));
						return;
					}

					console.log(chalk.bold(`${result.total} blueprint(s)\n`));
					for (const item of result.items) {
						console.log(
							`  ${chalk.bold(item.name)} ${chalk.gray(`[${item.layer}]`) + (item.technologies?.length ? chalk.gray(` [${item.technologies.map((t) => t.slug).join(', ')}]`) : '')} ${chalk.gray(`↓${item.downloadCount}`)}`,
						);
					}
				} catch (err) {
					const msg = err instanceof Error ? err.message : 'Unknown error';
					console.error(chalk.red(`Error: ${msg}`));
					process.exit(1);
				}
			},
		);
}
