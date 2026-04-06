import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';

export function registerProjectsCommand(program: Command) {
	const projectsCmd = program.command('projects').description('Manage projects');

	projectsCmd
		.command('list')
		.description('List all projects')
		.action(async () => {
			try {
				const client = createApiClient();
				const res = await client.api.projects.$get();
				const result = await unwrapResponse(res);

				if (!Array.isArray(result) || result.length === 0) {
					console.log(chalk.yellow('No projects found.'));
					return;
				}

				console.log(chalk.bold(`${result.length} project(s)\n`));
				for (const project of result) {
					console.log(`  ${chalk.bold(project.name)} ${chalk.cyan(`(${project.slug})`)}`);
					if (project.description) console.log(`  ${chalk.gray(project.description)}`);
					console.log();
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				console.error(chalk.red(`Error: ${msg}`));
				process.exit(1);
			}
		});

	projectsCmd
		.command('join <slug>')
		.description('Join a project (self-service)')
		.action(async (slug: string) => {
			try {
				const client = createApiClient();
				const res = await client.api.projects[':slug'].join.$post({ param: { slug } });
				const result = await unwrapResponse(res);

				if ('error' in result) {
					console.error(chalk.red(`✗ ${result.error}`));
					process.exit(1);
				}

				console.log(chalk.green(`✓ ${result.message} as ${result.role}`));
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				console.error(chalk.red(`Error: ${msg}`));
				process.exit(1);
			}
		});

	projectsCmd
		.command('leave <slug>')
		.description('Leave a project')
		.action(async (slug: string) => {
			try {
				const client = createApiClient();
				const res = await client.api.projects[':slug'].leave.$delete({ param: { slug } });
				const result = await unwrapResponse(res);

				if ('error' in result) {
					console.error(chalk.red(`✗ ${result.error}`));
					process.exit(1);
				}

				console.log(chalk.green(`✓ ${result.message}`));
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				console.error(chalk.red(`Error: ${msg}`));
				process.exit(1);
			}
		});

	projectsCmd
		.command('members <slug>')
		.description('List members of a project')
		.action(async (slug: string) => {
			try {
				const client = createApiClient();
				const res = await client.api.projects[':slug'].members.$get({ param: { slug } });
				const result = await unwrapResponse(res);

				if (!Array.isArray(result) || result.length === 0) {
					console.log(chalk.yellow('No members found.'));
					return;
				}

				console.log(chalk.bold(`${result.length} member(s)\n`));
				for (const member of result) {
					const roleTag =
						member.role === 'owner' ? chalk.yellow('[owner]') : chalk.gray('[member]');
					console.log(`  ${chalk.bold(member.name ?? member.userId)} ${roleTag}`);
				}
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				console.error(chalk.red(`Error: ${msg}`));
				process.exit(1);
			}
		});
}
