import chalk from 'chalk';
import type { Command } from 'commander';
import { apiFetch } from '../lib/api.js';

export function registerListCommand(program: Command) {
	program
		.command('list')
		.description('List blueprints')
		.option('--stack <stack>', 'Filter by stack')
		.option('--layer <layer>', 'Filter by layer')
		.option('--tag <tag>', 'Filter by tag')
		.option('--project <project>', 'Filter by project')
		.option('--author <author>', 'Filter by author ID')
		.action(
			async (opts: {
				stack?: string;
				layer?: string;
				tag?: string;
				project?: string;
				author?: string;
			}) => {
				try {
					const params = new URLSearchParams();
					if (opts.stack) params.set('stack', opts.stack);
					if (opts.layer) params.set('layer', opts.layer);
					if (opts.tag) params.set('tag', opts.tag);
					if (opts.project) params.set('projectId', opts.project);
					if (opts.author) params.set('authorId', opts.author);

					const query = params.toString();
					const result = (await apiFetch(`/blueprints${query ? `?${query}` : ''}`)) as {
						items: {
							name: string;
							slug: string;
							stack: string;
							layer: string;
							downloadCount: number;
						}[];
						total: number;
					};

					if (result.items.length === 0) {
						console.log(chalk.yellow('No blueprints found.'));
						return;
					}

					console.log(chalk.bold(`${result.total} blueprint(s)\n`));
					for (const item of result.items) {
						console.log(
							`  ${chalk.bold(item.name)} ${chalk.gray(`[${item.stack}/${item.layer}]`)} ${chalk.gray(`↓${item.downloadCount}`)}`,
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
