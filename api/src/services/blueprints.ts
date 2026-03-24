import { and, count, desc, eq } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import {
	blueprints,
	blueprintTags,
	blueprintVersions,
	projects,
	tags,
	users,
} from '../db/schema.js';
import type {
	CreateBlueprintInput,
	ListBlueprintsInput,
	UpdateBlueprintInput,
} from '../lib/validation.js';
import { generateSlug, normalizeTagName, shouldCreateNewVersion } from './blueprints.core.js';
import { prepareEmbeddingText } from './embeddings.core.js';
import { generateEmbedding } from './embeddings.js';

async function upsertTags(db: DB, tagNames: string[]) {
	const normalized = tagNames.map(normalizeTagName).filter(Boolean);
	if (normalized.length === 0) return [];

	const result = [];
	for (const name of normalized) {
		const slug = generateSlug(name);
		const existing = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
		if (existing.length > 0) {
			result.push(existing[0]);
		} else {
			const [created] = await db.insert(tags).values({ name, slug }).returning();
			result.push(created);
		}
	}
	return result;
}

export async function createBlueprint(db: DB, input: CreateBlueprintInput, authorId: string) {
	const slug = generateSlug(input.name);

	const [blueprint] = await db
		.insert(blueprints)
		.values({
			name: input.name,
			slug,
			description: input.description,
			usage: input.usage,
			stack: input.stack,
			layer: input.layer,
			projectId: input.projectId,
			authorId,
			isPublic: input.isPublic ?? true,
		})
		.returning();

	const [version] = await db
		.insert(blueprintVersions)
		.values({
			blueprintId: blueprint.id,
			version: 1,
			content: input.content,
			authorId,
		})
		.returning();

	await db
		.update(blueprints)
		.set({ currentVersionId: version.id })
		.where(eq(blueprints.id, blueprint.id));

	// Generate embedding asynchronously — don't block create
	try {
		const text = prepareEmbeddingText({
			description: input.description,
			usage: input.usage,
			content: input.content,
		});
		const embedding = await generateEmbedding(text);
		await db
			.update(blueprintVersions)
			.set({ embedding })
			.where(eq(blueprintVersions.id, version.id));
	} catch (err) {
		console.error('Failed to generate embedding for new blueprint:', err);
	}

	if (input.tags && input.tags.length > 0) {
		const tagRecords = await upsertTags(db, input.tags);
		await db.insert(blueprintTags).values(
			tagRecords.map((t) => ({
				blueprintId: blueprint.id,
				tagId: t.id,
			})),
		);
	}

	return { ...blueprint, currentVersionId: version.id };
}

export async function updateBlueprint(
	db: DB,
	id: string,
	input: UpdateBlueprintInput,
	authorId: string,
) {
	const [existing] = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);
	if (!existing) return null;

	let currentVersionContent: string | null = null;
	if (existing.currentVersionId) {
		const [ver] = await db
			.select()
			.from(blueprintVersions)
			.where(eq(blueprintVersions.id, existing.currentVersionId))
			.limit(1);
		if (ver) currentVersionContent = ver.content;
	}

	const needsNewVersion = shouldCreateNewVersion(currentVersionContent, input.content);

	const metadataUpdate: Record<string, unknown> = {};
	if (input.name !== undefined) {
		metadataUpdate.name = input.name;
		metadataUpdate.slug = generateSlug(input.name);
	}
	if (input.description !== undefined) metadataUpdate.description = input.description;
	if (input.usage !== undefined) metadataUpdate.usage = input.usage;
	if (input.stack !== undefined) metadataUpdate.stack = input.stack;
	if (input.layer !== undefined) metadataUpdate.layer = input.layer;
	if (input.projectId !== undefined) metadataUpdate.projectId = input.projectId;
	if (input.isPublic !== undefined) metadataUpdate.isPublic = input.isPublic;

	if (needsNewVersion && input.content) {
		const [latestVersion] = await db
			.select()
			.from(blueprintVersions)
			.where(eq(blueprintVersions.blueprintId, id))
			.orderBy(desc(blueprintVersions.version))
			.limit(1);

		const nextVersion = (latestVersion?.version ?? 0) + 1;

		const [newVersion] = await db
			.insert(blueprintVersions)
			.values({
				blueprintId: id,
				version: nextVersion,
				content: input.content,
				changelog: input.changelog,
				authorId,
			})
			.returning();

		metadataUpdate.currentVersionId = newVersion.id;

		// Generate embedding for new version — don't block update
		try {
			const text = prepareEmbeddingText({
				description: input.description ?? existing.description,
				usage: input.usage ?? existing.usage,
				content: input.content,
			});
			const embedding = await generateEmbedding(text);
			await db
				.update(blueprintVersions)
				.set({ embedding })
				.where(eq(blueprintVersions.id, newVersion.id));
		} catch (err) {
			console.error('Failed to generate embedding for updated blueprint:', err);
		}
	}

	if (Object.keys(metadataUpdate).length > 0) {
		await db.update(blueprints).set(metadataUpdate).where(eq(blueprints.id, id));
	}

	if (input.tags !== undefined) {
		await db.delete(blueprintTags).where(eq(blueprintTags.blueprintId, id));
		if (input.tags.length > 0) {
			const tagRecords = await upsertTags(db, input.tags);
			await db.insert(blueprintTags).values(
				tagRecords.map((t) => ({
					blueprintId: id,
					tagId: t.id,
				})),
			);
		}
	}

	const [updated] = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);
	return updated;
}

export async function listBlueprints(db: DB, input: ListBlueprintsInput) {
	const { page, limit, stack, layer, tag, projectId, authorId } = input;
	const offset = (page - 1) * limit;

	const conditions = [];
	if (stack) conditions.push(eq(blueprints.stack, stack));
	if (layer) conditions.push(eq(blueprints.layer, layer));
	if (projectId) conditions.push(eq(blueprints.projectId, projectId));
	if (authorId) conditions.push(eq(blueprints.authorId, authorId));

	let query = db
		.select({
			id: blueprints.id,
			name: blueprints.name,
			slug: blueprints.slug,
			description: blueprints.description,
			usage: blueprints.usage,
			stack: blueprints.stack,
			layer: blueprints.layer,
			isPublic: blueprints.isPublic,
			downloadCount: blueprints.downloadCount,
			createdAt: blueprints.createdAt,
			updatedAt: blueprints.updatedAt,
			authorId: blueprints.authorId,
			authorName: users.name,
			projectId: blueprints.projectId,
		})
		.from(blueprints)
		.leftJoin(users, eq(blueprints.authorId, users.id))
		.$dynamic();

	if (tag) {
		query = query
			.innerJoin(blueprintTags, eq(blueprints.id, blueprintTags.blueprintId))
			.innerJoin(tags, and(eq(blueprintTags.tagId, tags.id), eq(tags.name, tag)));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;
	if (where) query = query.where(where);

	const items = await query.orderBy(desc(blueprints.createdAt)).limit(limit).offset(offset);

	const countQuery = db.select({ total: count() }).from(blueprints).$dynamic();

	let countQ = countQuery;
	if (tag) {
		countQ = countQ
			.innerJoin(blueprintTags, eq(blueprints.id, blueprintTags.blueprintId))
			.innerJoin(tags, and(eq(blueprintTags.tagId, tags.id), eq(tags.name, tag)));
	}
	if (where) countQ = countQ.where(where);

	const [{ total }] = await countQ;

	return { items, total, page, limit };
}

export async function getBlueprintById(db: DB, id: string) {
	const [blueprint] = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);
	if (!blueprint) return null;

	const [author] = await db.select().from(users).where(eq(users.id, blueprint.authorId)).limit(1);

	let currentVersion = null;
	if (blueprint.currentVersionId) {
		const [ver] = await db
			.select()
			.from(blueprintVersions)
			.where(eq(blueprintVersions.id, blueprint.currentVersionId))
			.limit(1);
		currentVersion = ver ?? null;
	}

	const blueprintTagRows = await db
		.select({ name: tags.name, slug: tags.slug })
		.from(blueprintTags)
		.innerJoin(tags, eq(blueprintTags.tagId, tags.id))
		.where(eq(blueprintTags.blueprintId, id));

	let project = null;
	if (blueprint.projectId) {
		const [p] = await db
			.select()
			.from(projects)
			.where(eq(projects.id, blueprint.projectId))
			.limit(1);
		project = p ?? null;
	}

	return {
		...blueprint,
		author: author ?? null,
		currentVersion,
		tags: blueprintTagRows,
		project,
	};
}

export async function deleteBlueprintById(db: DB, id: string) {
	await db.delete(blueprintTags).where(eq(blueprintTags.blueprintId, id));
	await db.update(blueprints).set({ currentVersionId: null }).where(eq(blueprints.id, id));
	await db.delete(blueprintVersions).where(eq(blueprintVersions.blueprintId, id));
	await db.delete(blueprints).where(eq(blueprints.id, id));
}

export async function listVersions(db: DB, blueprintId: string) {
	return db
		.select()
		.from(blueprintVersions)
		.where(eq(blueprintVersions.blueprintId, blueprintId))
		.orderBy(desc(blueprintVersions.version));
}

export async function getVersion(db: DB, blueprintId: string, version: number) {
	const [ver] = await db
		.select()
		.from(blueprintVersions)
		.where(
			and(eq(blueprintVersions.blueprintId, blueprintId), eq(blueprintVersions.version, version)),
		)
		.limit(1);
	return ver ?? null;
}
