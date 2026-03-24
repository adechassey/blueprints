import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Stack } from '@blueprints/shared';
import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';
import { getConfig } from '../lib/config.js';
import { parseFrontmatter } from '../lib/frontmatter.core.js';

export function registerPushCommand(program: Command) {
	program
		.command('push [file]')
		.description('Push a blueprint markdown file to the registry')
		.option('--project <name>', 'Publish under a project namespace')
		.option('--dir <path>', 'Push all .md files in directory')
		.action(async (file: string | undefined, opts: { project?: string; dir?: string }) => {
			const files: string[] = [];

			if (opts.dir) {
				const dir = opts.dir;
				const entries = readdirSync(dir).filter((f) => f.endsWith('.md'));
				for (const entry of entries) {
					files.push(join(dir, entry));
				}
			} else if (file) {
				files.push(file);
			} else {
				console.error(chalk.red('Please provide a file path or --dir flag'));
				process.exit(1);
			}

			const client = createApiClient();
			const config = getConfig();

			for (const filePath of files) {
				try {
					const raw = readFileSync(filePath, 'utf-8');
					const { meta, content } = parseFrontmatter(raw);

					const payload = {
						name: meta.name || filePath.replace(/.*\//, '').replace(/\.md$/, ''),
						description: meta.description,
						usage: meta.usage,
						stack: (meta.stack || 'server') as Stack,
						layer: meta.layer || 'unknown',
						tags: meta.tags,
						content,
					};

					const res = await client.api.blueprints.$post({ json: payload });
					const result = await unwrapResponse(res);

					if ('error' in result) {
						console.error(chalk.red(`✗ Failed to push ${filePath}: ${result.error}`));
						continue;
					}

					const url = `${config.server}/blueprints/${result.id}`;
					console.log(chalk.green(`✓ Created: ${result.name} (${result.slug}) v1`));
					console.log(chalk.gray(`  ${url}`));
				} catch (err) {
					const msg = err instanceof Error ? err.message : 'Unknown error';
					console.error(chalk.red(`✗ Failed to push ${filePath}: ${msg}`));
				}
			}
		});
}
