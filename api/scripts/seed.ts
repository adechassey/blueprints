#!/usr/bin/env tsx
/**
 * Seed script — fills a local database with synthetic blueprints.
 *
 * Usage: pnpm --filter api db:seed
 *
 * Idempotent: checks by slug before creating. The blueprints live in
 * seed-blueprints.ts and are invented: real ones belong to the registry's
 * database, never to this repository (see "Client data" in CLAUDE.md).
 */

import { eq, inArray } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import {
	blueprints,
	blueprintTags,
	blueprintTechnologies,
	blueprintVersions,
	projectMembers,
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
import { SEED_BLUEPRINTS } from './seed-blueprints.js';

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
	const projectSlug = 'demo-project';
	let [defaultProject] = await db
		.select()
		.from(projects)
		.where(eq(projects.slug, projectSlug))
		.limit(1);
	if (!defaultProject) {
		[defaultProject] = await db
			.insert(projects)
			.values({
				name: 'Demo Project',
				slug: projectSlug,
				description: 'Default project for seeded blueprints',
				createdBy: systemUser.id,
			})
			.returning();
		await db
			.insert(projectMembers)
			.values({ projectId: defaultProject.id, userId: systemUser.id, role: 'owner' });
		console.log('  ✓ Created default project "demo-project"');
	} else {
		console.log('  ✓ Default project exists');
	}

	// 4. Seed the synthetic blueprints, owned by the default project
	console.log(`\n  Seeding ${SEED_BLUEPRINTS.length} synthetic blueprints\n`);

	const techRecords = await db
		.select({ id: technologies.id, slug: technologies.slug })
		.from(technologies);
	const techBySlug = new Map(techRecords.map((t) => [t.slug, t.id]));

	let created = 0;
	let skipped = 0;
	let embeddings = 0;

	for (const seed of SEED_BLUEPRINTS) {
		const slug = generateSlug(seed.name);

		const [existing] = await db
			.select({ id: blueprints.id })
			.from(blueprints)
			.where(eq(blueprints.slug, slug))
			.limit(1);
		if (existing) {
			skipped++;
			continue;
		}

		const [blueprint] = await db
			.insert(blueprints)
			.values({
				name: seed.name,
				slug,
				description: seed.description,
				usage: seed.usage,
				layer: seed.layer,
				authorId: systemUser.id,
				projectId: defaultProject.id,
			})
			.returning();
		if (!blueprint) throw new Error(`Insert blueprint failed: ${slug}`);

		const [version] = await db
			.insert(blueprintVersions)
			.values({
				blueprintId: blueprint.id,
				version: 1,
				content: seed.content,
				authorId: systemUser.id,
			})
			.returning();
		if (!version) throw new Error(`Insert version failed: ${slug}`);

		await db
			.update(blueprints)
			.set({ currentVersionId: version.id })
			.where(eq(blueprints.id, blueprint.id));

		for (const tagName of seed.tags) {
			let [tag] = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
			if (!tag) {
				[tag] = await db
					.insert(tags)
					.values({ name: tagName, slug: generateSlug(tagName) })
					.returning();
			}
			if (tag) await db.insert(blueprintTags).values({ blueprintId: blueprint.id, tagId: tag.id });
		}

		const techIds = seed.technologies
			.map((techSlug) => techBySlug.get(techSlug))
			.filter((id) => id !== undefined);
		if (techIds.length > 0) {
			await db
				.insert(blueprintTechnologies)
				.values(techIds.map((technologyId) => ({ blueprintId: blueprint.id, technologyId })));
		}

		try {
			const embedding = await generateEmbedding(
				prepareEmbeddingText({
					description: seed.description,
					usage: seed.usage,
					content: seed.content,
				}),
			);
			await db
				.update(blueprintVersions)
				.set({ embedding })
				.where(eq(blueprintVersions.id, version.id));
			embeddings++;
		} catch (err) {
			console.error(`  ⚠ Failed embedding for ${slug}:`, err);
		}

		created++;
		console.log(`  ✓ ${seed.name}`);
	}

	console.log(`\n🌱 Seed complete!`);
	console.log(`  Created: ${created}`);
	console.log(`  Skipped: ${skipped}`);
	console.log(`  Embeddings: ${embeddings}`);
	console.log('\n  Join "demo-project" from the app to publish into it.');

	process.exit(0);
}

main().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
