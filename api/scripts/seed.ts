#!/usr/bin/env tsx
/**
 * Seed script — imports 85 blueprints from webapp/src/assets/blueprints/
 *
 * Usage: pnpm --filter api db:seed
 *
 * Idempotent: checks by slug before creating.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import {
	blueprints,
	blueprintTags,
	blueprintVersions,
	projects,
	tags,
	users,
} from '../src/db/schema.js';
import { generateSlug } from '../src/services/blueprints.core.js';
import { prepareEmbeddingText } from '../src/services/embeddings.core.js';
import { generateEmbedding } from '../src/services/embeddings.js';

const BLUEPRINTS_DIR = join(__dirname, '..', '..', 'webapp', 'src', 'assets', 'blueprints');

interface FrontmatterMeta {
	name?: string;
	description?: string;
	usage?: string;
	project?: string;
	layer?: string;
	id?: string;
	source?: string;
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

function inferStack(projectField?: string): 'server' | 'webapp' | 'shared' | 'fullstack' {
	if (!projectField) return 'server';
	const lower = projectField.toLowerCase();
	if (lower === 'webapp' || lower === 'web') return 'webapp';
	if (lower === 'shared') return 'shared';
	if (lower === 'fullstack') return 'fullstack';
	return 'server';
}

async function main() {
	console.log('🌱 Starting seed...\n');

	// 1. Create or find system user
	const systemEmail = 'system@blueprints.local';
	let [systemUser] = await db.select().from(users).where(eq(users.email, systemEmail)).limit(1);
	if (!systemUser) {
		[systemUser] = await db
			.insert(users)
			.values({ email: systemEmail, name: 'System', role: 'admin' })
			.returning();
		console.log('  ✓ Created system user');
	} else {
		console.log('  ✓ System user exists');
	}

	// 2. Create or find default project
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

	// 3. Read all markdown files
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
		const stack = inferStack(meta.project);
		const layer = meta.layer || 'unknown';

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
				stack,
				layer,
				projectId: defaultProject.id,
				authorId: systemUser.id,
			})
			.returning();

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
