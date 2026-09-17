import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';
import { buildScaffoldFiles } from '../lib/scaffold.core.js';

interface StackSummary {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	technologies: { id: string; name: string; slug: string }[];
}

interface StackBlueprintsResponse {
	stack: { slug: string; name: string; description: string | null };
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

function printStack(stack: StackSummary, detailed = false) {
	console.log(chalk.bold(`${stack.name} `) + chalk.gray(`(${stack.slug})`));
	if (stack.description) console.log(`  ${stack.description}`);
	console.log(
		`  ${chalk.gray('Technologies:')} ${stack.technologies.map((t) => t.slug).join(', ')}`,
	);
	if (detailed) {
		console.log(chalk.gray('\n  Fetch blueprints with: theodo-blueprints stack scaffold'));
	}
}

export function registerStackCommand(program: Command) {
	const stack = program.command('stack').description('Manage technology stacks');

	stack
		.command('list')
		.description('List available stacks')
		.action(async () => {
			try {
				const client = createApiClient();
				const res = await client.api.stacks.$get();
				const stacks = await unwrapResponse(res);

				if (stacks.length === 0) {
					console.log(chalk.yellow('No stacks found.'));
					return;
				}
				console.log(chalk.bold(`${stacks.length} stack(s)\n`));
				for (const s of stacks) {
					printStack(s as StackSummary);
					console.log('');
				}
			} catch (err) {
				console.error(chalk.red(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`));
				process.exit(1);
			}
		});

	stack
		.command('show <stack>')
		.description('Show a stack and its blueprints grouped by layer')
		.action(async (stackSlug: string) => {
			try {
				const client = createApiClient();
				const res = await client.api.stacks[':id'].blueprints.$get({ param: { id: stackSlug } });
				const result = (await unwrapResponse(res)) as StackBlueprintsResponse;

				printStack(
					{
						id: result.stack.slug,
						name: result.stack.name,
						slug: result.stack.slug,
						description: result.stack.description,
						technologies: result.technologies.map((t) => ({ ...t, id: t.slug })),
					},
					true,
				);

				const total = result.layers.reduce((acc, l) => acc + l.blueprints.length, 0);
				console.log(chalk.bold(`\n${total} blueprint(s)\n`));
				for (const group of result.layers) {
					console.log(chalk.bold(chalk.cyan(`  ${group.layer}`)));
					for (const bp of group.blueprints) {
						console.log(`    ${chalk.bold(bp.name)} ${chalk.gray(bp.slug)}`);
					}
					console.log('');
				}
			} catch (err) {
				console.error(chalk.red(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`));
				process.exit(1);
			}
		});

	stack
		.command('scaffold <stack> <dir>')
		.description('Scaffold a boilerplate directory from a stack: one markdown blueprint per layer')
		.action(async (stackSlug: string, dir: string) => {
			try {
				const client = createApiClient();
				const res = await client.api.stacks[':id'].blueprints.$get({ param: { id: stackSlug } });
				const result = (await unwrapResponse(res)) as StackBlueprintsResponse;

				const blueprints = result.layers.flatMap((l) => l.blueprints);
				if (blueprints.length === 0) {
					console.log(chalk.yellow(`No blueprints in stack "${stackSlug}" — nothing to scaffold.`));
					return;
				}

				const files = buildScaffoldFiles(result.stack, result.technologies, blueprints);
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
				console.log(chalk.gray(`  ${dir}/stack.json — manifest of the scaffold run`));
			} catch (err) {
				console.error(chalk.red(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`));
				process.exit(1);
			}
		});
}
