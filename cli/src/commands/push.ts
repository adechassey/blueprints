import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLUEPRINT_LAYERS, type BlueprintLayer } from '@blueprints/shared';
import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';
import { getConfig } from '../lib/config.js';
import { parseFrontmatter } from '../lib/frontmatter.core.js';

async function resolveProjectId(
	client: ReturnType<typeof createApiClient>,
	slug: string,
): Promise<string | undefined> {
	try {
		const res = await client.api.projects[':slug'].$get({ param: { slug } });
		const project = await unwrapResponse(res);
		if ('error' in project) return undefined;
		return project.id;
	} catch {
		return undefined;
	}
}

export function registerPushCommand(program: Command) {
	program
		.command('push [file]')
		.description('Push a blueprint markdown file to the registry')
		.option(
			'--project <slug>',
			'Project that owns the blueprints (must be a member; defaults to the frontmatter project or the config default)',
		)
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

			// Resolve project UUID once (if --project or a config default was given)
			let projectId: string | undefined;
			const projectSlug = opts.project ?? config.defaultProject;
			if (projectSlug) {
				projectId = await resolveProjectId(client, projectSlug);
				if (!projectId) {
					console.error(chalk.red(`✗ Project not found: ${projectSlug}`));
					process.exit(1);
				}
			}

			for (const filePath of files) {
				try {
					const raw = readFileSync(filePath, 'utf-8');
					const { meta, content } = parseFrontmatter(raw);

					// Project from frontmatter (meta.project) takes lower priority than --project flag
					let resolvedProjectId = projectId;
					if (!resolvedProjectId && meta.project) {
						resolvedProjectId = await resolveProjectId(client, meta.project);
						if (!resolvedProjectId) {
							console.error(chalk.red(`✗ Project not found: ${meta.project}`));
							continue;
						}
					}
					// A blueprint belongs to exactly one project
					if (!resolvedProjectId) {
						console.error(
							chalk.red(
								`✗ No project for ${filePath}: pass --project <slug>, add "project:" to the frontmatter, or set a default project in the config`,
							),
						);
						continue;
					}

					if (!meta.layer || !BLUEPRINT_LAYERS.includes(meta.layer as never)) {
						console.error(
							chalk.red(
								`✗ Invalid or missing layer in frontmatter: "${meta.layer}"\n` +
									`  Allowed layers: ${BLUEPRINT_LAYERS.join(', ')}`,
							),
						);
						continue;
					}

					const payload = {
						name: meta.name || filePath.replace(/.*\//, '').replace(/\.md$/, ''),
						description: meta.description,
						usage: meta.usage,
						technologies: meta.technologies,
						layer: meta.layer as BlueprintLayer,
						tags: meta.tags,
						content,
						projectId: resolvedProjectId,
					};

					const res = await client.api.blueprints.$post({ json: payload });
					const result = await unwrapResponse(res);

					if ('error' in result) {
						console.error(chalk.red(`✗ Failed to push ${filePath}: ${result.error}`));
						continue;
					}

					const url = `${config.server}/blueprints/${result.id}`;
					const projectTag = chalk.gray(` [${projectSlug ?? meta.project}]`);
					console.log(chalk.green(`✓ Created: ${result.name} (${result.slug}) v1${projectTag}`));
					console.log(chalk.gray(`  ${url}`));
				} catch (err) {
					const msg = err instanceof Error ? err.message : 'Unknown error';
					console.error(chalk.red(`✗ Failed to push ${filePath}: ${msg}`));
				}
			}
		});
}
