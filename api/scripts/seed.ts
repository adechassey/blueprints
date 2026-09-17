#!/usr/bin/env tsx
/**
 * Seed script — imports 85 blueprints from webapp/src/assets/blueprints/
 *
 * Usage: pnpm --filter api db:seed
 *
 * Idempotent: checks by slug before creating.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import {
	blueprintProjects,
	blueprints,
	blueprintTags,
	blueprintTechnologies,
	blueprintVersions,
	projects,
	stacks,
	stackTechnologies,
	tags,
	technologies,
	users,
} from '../src/db/schema.js';
import { generateSlug } from '../src/services/blueprints.core.js';
import { prepareEmbeddingText } from '../src/services/embeddings.core.js';
import { generateEmbedding } from '../src/services/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BLUEPRINTS_DIR = join(__dirname, '..', '..', 'webapp', 'src', 'assets', 'blueprints');

interface FrontmatterMeta {
	name?: string;
	description?: string;
	usage?: string;
	project?: string;
	layer?: string;
	technologies?: string;
	id?: string;
	source?: string;
}

/** Fallback technologies per legacy `project` frontmatter field. */
const STACK_TECHNOLOGIES: Record<string, string[]> = {
	webapp: ['react', 'vite', 'tailwindcss'],
	shared: ['typescript', 'zod'],
	server: ['node', 'hono', 'drizzle'],
};

/** Maps legacy free-text layers onto the closed blueprint_layer enum. */
const LAYER_MAP: Record<string, string> = {
	adapter: 'database',
	repository: 'database',
	schema: 'database',
	dto: 'database',
	controller: 'api',
	route: 'api',
	middleware: 'api',
	guard: 'api',
	service: 'domain',
	core: 'domain',
	module: 'domain',
	error: 'domain',
	pattern: 'domain',
	unknown: 'domain',
	atom: 'ui',
	molecule: 'ui',
	organism: 'ui',
	page: 'ui',
	hook: 'ui',
	component: 'ui',
	state: 'state',
	infra: 'infra',
	testing: 'testing',
	tooling: 'tooling',
};

function normalizeLayer(
	layer: string | undefined,
): 'database' | 'api' | 'domain' | 'ui' | 'state' | 'infra' | 'testing' | 'tooling' {
	return (LAYER_MAP[layer ?? ''] ?? 'domain') as never;
}

function parseFrontmatter(raw: string): { meta: FrontmatterMeta; content: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { meta: {}, content: raw };

	const meta: FrontmatterMeta = {};
	for (const line of match[1].split('\n')) {
		const idx = line.indexOf(':');
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim() as keyof FrontmatterMeta;
		const value = line
			.slice(idx + 1)
			.trim()
			.replace(/^["']|["']$/g, '');
		meta[key] = value;
	}
	return { meta, content: match[2].trim() };
}

async function main() {
	console.log('🌱 Starting seed...\n');

	// 1. Create or find system user
	const systemEmail = 'system@blueprints.local';
	let [systemUser] = await db.select().from(users).where(eq(users.email, systemEmail)).limit(1);
	if (!systemUser) {
		[systemUser] = await db
			.insert(users)
			.values({ id: 'system', email: systemEmail, name: 'System', role: 'admin' })
			.returning();
		console.log('  ✓ Created system user');
	} else {
		console.log('  ✓ System user exists');
	}

	// 2. Seed the default stack (preset of technologies used by the scaffold command;
	// the technology catalog itself comes from migration 0009_technology_catalog)
	const defaultStackSlug = 'theodo-node-react';
	const [existingStack] = await db
		.select({ id: stacks.id })
		.from(stacks)
		.where(eq(stacks.slug, defaultStackSlug))
		.limit(1);
	if (!existingStack) {
		const [stack] = await db
			.insert(stacks)
			.values({
				name: 'Theodo Node/React',
				slug: defaultStackSlug,
				description:
					'Reference fullstack stack: Node.js + Hono + Drizzle on the server, React + Vite + Tailwind on the webapp.',
				createdBy: systemUser.id,
			})
			.returning();
		const stackTechSlugs = [
			'typescript',
			'node',
			'hono',
			'drizzle',
			'postgresql',
			'zod',
			'react',
			'vite',
			'tailwindcss',
			'tanstack-router',
			'tanstack-query',
		];
		const stackTechs = await db
			.select({ id: technologies.id, slug: technologies.slug })
			.from(technologies)
			.where(inArray(technologies.slug, stackTechSlugs));
		if (stackTechs.length > 0) {
			await db.insert(stackTechnologies).values(
				stackTechs.map((t) => ({
					stackId: stack.id,
					technologyId: t.id,
				})),
			);
		}
		console.log(
			`  ✓ Created default stack "${defaultStackSlug}" (${stackTechs.length} technologies)`,
		);
	} else {
		console.log('  ✓ Default stack exists');
	}

	// 4. Create or find default project
	const projectSlug = 'aquila-ap';
	let [defaultProject] = await db
		.select()
		.from(projects)
		.where(eq(projects.slug, projectSlug))
		.limit(1);
	if (!defaultProject) {
		[defaultProject] = await db
			.insert(projects)
			.values({
				name: 'Aquila AP',
				slug: projectSlug,
				description: 'Default project for seeded blueprints',
				createdBy: systemUser.id,
			})
			.returning();
		console.log('  ✓ Created default project "aquila-ap"');
	} else {
		console.log('  ✓ Default project exists');
	}

	// 4. Read all markdown files
	const files = readdirSync(BLUEPRINTS_DIR).filter((f) => f.endsWith('.md'));
	console.log(`\n  Found ${files.length} blueprint files\n`);

	let created = 0;
	let skipped = 0;
	let embeddings = 0;

	for (const file of files) {
		const raw = readFileSync(join(BLUEPRINTS_DIR, file), 'utf-8');
		const { meta, content } = parseFrontmatter(raw);

		const name = meta.name || file.replace(/\.md$/, '');
		const slug = generateSlug(name);
		const layer = normalizeLayer(meta.layer);

		// Frontmatter `technologies` wins; fallback to the legacy `project` field mapping
		const techSlugs = meta.technologies
			? meta.technologies
					.split(',')
					.map((t) => t.trim().toLowerCase())
					.filter(Boolean)
			: (STACK_TECHNOLOGIES[meta.project ?? ''] ?? STACK_TECHNOLOGIES.server);

		// Check if already exists
		const [existing] = await db.select().from(blueprints).where(eq(blueprints.slug, slug)).limit(1);

		if (existing) {
			skipped++;
			continue;
		}

		// Create blueprint
		const [blueprint] = await db
			.insert(blueprints)
			.values({
				name,
				slug,
				description: meta.description || null,
				usage: meta.usage || null,
				layer,
				authorId: systemUser.id,
			})
			.returning();

		// Link to the default project
		await db
			.insert(blueprintProjects)
			.values({ blueprintId: blueprint.id, projectId: defaultProject.id });

		// Create version
		const [version] = await db
			.insert(blueprintVersions)
			.values({
				blueprintId: blueprint.id,
				version: 1,
				content,
				authorId: systemUser.id,
			})
			.returning();

		await db
			.update(blueprints)
			.set({ currentVersionId: version.id })
			.where(eq(blueprints.id, blueprint.id));

		// Create tags from layer
		if (layer && layer !== 'unknown') {
			const tagName = layer.toLowerCase();
			const tagSlug = generateSlug(tagName);
			let [tag] = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
			if (!tag) {
				[tag] = await db.insert(tags).values({ name: tagName, slug: tagSlug }).returning();
			}
			await db.insert(blueprintTags).values({ blueprintId: blueprint.id, tagId: tag.id });
		}

		// Link technologies
		const techRecords = await db
			.select({ id: technologies.id, slug: technologies.slug })
			.from(technologies);
		const techBySlug = new Map(techRecords.map((t) => [t.slug, t.id]));
		const techIds = techSlugs.map((s) => techBySlug.get(s)).filter((id) => id !== undefined);
		if (techIds.length > 0) {
			await db
				.insert(blueprintTechnologies)
				.values(techIds.map((technologyId) => ({ blueprintId: blueprint.id, technologyId })));
		}

		// Generate embedding
		try {
			const text = prepareEmbeddingText({
				description: meta.description,
				usage: meta.usage,
				content,
			});
			const embedding = await generateEmbedding(text);
			await db
				.update(blueprintVersions)
				.set({ embedding })
				.where(eq(blueprintVersions.id, version.id));
			embeddings++;
		} catch (err) {
			console.error(`  ⚠ Failed embedding for ${slug}:`, err);
		}

		created++;
		if (created % 10 === 0) {
			console.log(`  ... ${created} blueprints created`);
		}
	}

	console.log(`\n🌱 Seed complete!`);
	console.log(`  Created: ${created}`);
	console.log(`  Skipped: ${skipped}`);
	console.log(`  Embeddings: ${embeddings}`);

	process.exit(0);
}

main().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
