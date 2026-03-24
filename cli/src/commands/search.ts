import chalk from 'chalk';
import type { Command } from 'commander';
import { apiFetch } from '../lib/api.js';

export function registerSearchCommand(program: Command) {
	program
		.command('search <query>')
		.description('Search blueprints with natural language')
		.option('--stack <stack>', 'Filter by stack')
		.option('--layer <layer>', 'Filter by layer')
		.option('--tag <tag>', 'Filter by tag')
		.option('--project <project>', 'Filter by project')
		.option('--author <author>', 'Filter by author ID')
		.action(
			async (
				query: string,
				opts: {
					stack?: string;
					layer?: string;
					tag?: string;
					project?: string;
					author?: string;
				},
			) => {
				try {
					const params = new URLSearchParams({ q: query });
					if (opts.stack) params.set('stack', opts.stack);
					if (opts.layer) params.set('layer', opts.layer);
					if (opts.tag) params.set('tag', opts.tag);
					if (opts.project) params.set('projectId', opts.project);
					if (opts.author) params.set('authorId', opts.author);

					const result = (await apiFetch(`/blueprints/search?${params}`)) as {
						items: {
							name: string;
							slug: string;
							description?: string;
							stack: string;
							score?: number;
						}[];
					};

					if (result.items.length === 0) {
						console.log(chalk.yellow('No results found.'));
						return;
					}

					for (const item of result.items) {
						const score = item.score ? chalk.gray(` (${Math.round(item.score * 100)}%)`) : '';
						console.log(`${chalk.bold(item.name)}${score}`);
						console.log(`  ${chalk.cyan(item.stack)} · ${item.slug}`);
						if (item.description) console.log(`  ${chalk.gray(item.description)}`);
						console.log();
					}
				} catch (err) {
					const msg = err instanceof Error ? err.message : 'Unknown error';
					console.error(chalk.red(`Error: ${msg}`));
					process.exit(1);
				}
			},
		);
}
