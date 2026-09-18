import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';
import { buildScaffoldFiles } from '../lib/scaffold.core.js';

interface ProjectScaffoldResponse {
	project: { slug: string; name: string; description: string | null };
	technologies: { name: string; slug: string }[];
	layers: {
		layer: string;
		blueprints: {
			slug: string;
			name: string;
			layer: string;
			description: string | null;
			technologies: string[];
			content: string;
		}[];
	}[];
}

export function registerScaffoldCommand(program: Command) {
	program
		.command('scaffold <project> <dir>')
		.description(
			'Scaffold a boilerplate directory from a project: every blueprint of the project as one markdown file, grouped by layer',
		)
		.action(async (projectSlug: string, dir: string) => {
			try {
				const client = createApiClient();
				const res = await client.api.projects[':slug'].scaffold.$get({
					param: { slug: projectSlug },
				});
				const result = (await unwrapResponse(res)) as ProjectScaffoldResponse;

				const blueprints = result.layers.flatMap((l) => l.blueprints);
				if (blueprints.length === 0) {
					console.log(
						chalk.yellow(`No blueprints in project "${projectSlug}" — nothing to scaffold.`),
					);
					return;
				}

				const files = buildScaffoldFiles(result.project, result.technologies, blueprints);
				for (const [relativePath, content] of files) {
					const filePath = join(dir, relativePath);
					mkdirSync(dirname(filePath), { recursive: true });
					writeFileSync(filePath, content);
				}

				console.log(chalk.green(`✓ Scaffolded ${blueprints.length} blueprint(s) in ${dir}/`));
				for (const group of result.layers) {
					console.log(
						`  ${chalk.cyan(group.layer.padEnd(10))} ${chalk.gray(`${group.blueprints.length} blueprint(s)`)}`,
					);
				}
				console.log(chalk.gray(`\n  ${dir}/index.md — start here`));
				console.log(chalk.gray(`  ${dir}/scaffold.json — manifest of the scaffold run`));
			} catch (err) {
				console.error(chalk.red(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`));
				process.exit(1);
			}
		});
}
