import { and, count, desc, eq, notExists, sql } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import {
	blueprintProjects,
	blueprints,
	blueprintTags,
	blueprintVersions,
	projects,
	tags,
	users,
} from '../db/schema.js';
import { logger } from '../lib/logger.js';
import type {
	CreateBlueprintInput,
	ListBlueprintsInput,
	UpdateBlueprintInput,
} from '../lib/validation.js';
import {
	generateSlug,
	normalizeTagName,
	pickSlug,
	pickSlugCandidate,
	SlugConflictError,
	shouldCreateNewVersion,
} from './blueprints.core.js';
import { prepareEmbeddingText } from './embeddings.core.js';
import { generateEmbedding } from './embeddings.js';

async function upsertTags(db: DB, tagNames: string[]) {
	const normalized = tagNames.map(normalizeTagName).filter(Boolean);
	if (normalized.length === 0) return [];

	const result = [];
	for (const name of normalized) {
		const slug = generateSlug(name);
		const existing = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
		const first = existing[0];
		if (first) {
			result.push(first);
		} else {
			const [created] = await db.insert(tags).values({ name, slug }).returning();
			if (!created) throw new Error('Insert tag failed');
			result.push(created);
		}
	}
	return result;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A slug namespace: the id of a project, or null for the project-less pool.
 * Slugs are unique within a namespace, never across them.
 */
type SlugNamespace = string | null;

/** Resolves a project given as a UUID or a slug to its id (null when unknown). */
async function resolveProjectId(db: DB, project: string): Promise<string | null> {
	const condition = UUID_RE.test(project) ? eq(projects.id, project) : eq(projects.slug, project);
	const [p] = await db.select({ id: projects.id }).from(projects).where(condition).limit(1);
	return p?.id ?? null;
}

async function projectRowsOf(db: DB, blueprintId: string) {
	return db
		.select({ id: projects.id, name: projects.name, slug: projects.slug })
		.from(blueprintProjects)
		.innerJoin(projects, eq(blueprintProjects.projectId, projects.id))
		.where(eq(blueprintProjects.blueprintId, blueprintId));
}

/** The namespaces a blueprint's slug lives in: each of its projects, or the global pool. */
async function namespacesOf(db: DB, blueprintId: string): Promise<SlugNamespace[]> {
	const rows = await projectRowsOf(db, blueprintId);
	return rows.length === 0 ? [null] : rows.map((r) => r.id);
}

/** Human label for conflict messages: the project slug, or null for the global pool. */
async function namespaceLabel(db: DB, namespace: SlugNamespace): Promise<string | null> {
	if (namespace === null) return null;
	const [p] = await db
		.select({ slug: projects.slug })
		.from(projects)
		.where(eq(projects.id, namespace))
		.limit(1);
	return p?.slug ?? namespace;
}

function selectIdsBySlugInNamespace(db: DB, slug: string, namespace: SlugNamespace) {
	if (namespace === null) {
		const linked = db
			.select({ one: sql`1` })
			.from(blueprintProjects)
			.where(eq(blueprintProjects.blueprintId, blueprints.id));
		return db
			.select({ id: blueprints.id })
			.from(blueprints)
			.where(and(eq(blueprints.slug, slug), notExists(linked)));
	}
	return db
		.select({ id: blueprints.id })
		.from(blueprints)
		.innerJoin(
			blueprintProjects,
			and(
				eq(blueprintProjects.blueprintId, blueprints.id),
				eq(blueprintProjects.projectId, namespace),
			),
		)
		.where(eq(blueprints.slug, slug));
}

/** True when a blueprint other than `excludeId` already uses `slug` in the namespace. */
export async function isSlugTaken(
	db: DB,
	slug: string,
	namespace: SlugNamespace,
	excludeId?: string,
): Promise<boolean> {
	const rows = await selectIdsBySlugInNamespace(db, slug, namespace);
	return rows.some((r) => r.id !== excludeId);
}

export async function createBlueprint(db: DB, input: CreateBlueprintInput, authorId: string) {
	const namespace: SlugNamespace = input.projectId ?? null;
	const requested = input.slug ?? generateSlug(input.name);
	const slug = pickSlug({
		requested,
		explicit: input.slug !== undefined,
		taken: await isSlugTaken(db, requested, namespace),
		projectLabel: await namespaceLabel(db, namespace),
	});

	const [blueprint] = await db
		.insert(blueprints)
		.values({
			name: input.name,
			slug,
			description: input.description,
			usage: input.usage,
			stack: input.stack,
			layer: input.layer,
			source: input.source,
			authorId,
			isPublic: input.isPublic ?? true,
		})
		.returning();
	if (!blueprint) throw new Error('Insert blueprint failed');

	const [version] = await db
		.insert(blueprintVersions)
		.values({
			blueprintId: blueprint.id,
			version: 1,
			content: input.content,
			authorId,
		})
		.returning();
	if (!version) throw new Error('Insert blueprint version failed');

	await db
		.update(blueprints)
		.set({ currentVersionId: version.id })
		.where(eq(blueprints.id, blueprint.id));

	// Link to project if provided
	if (input.projectId) {
		await db.insert(blueprintProjects).values({
			blueprintId: blueprint.id,
			projectId: input.projectId,
			addedBy: authorId,
		});
	}

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
		logger.error({ err }, 'Failed to generate embedding for new blueprint');
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
	}
	// Explicit slug wins (used by sync to pin the pattern-id as identity);
	// otherwise regenerate the slug only when the name actually changes.
	if (input.slug !== undefined) {
		metadataUpdate.slug = input.slug;
	} else if (input.name !== undefined && input.name !== existing.name) {
		metadataUpdate.slug = generateSlug(input.name);
	}
	if (metadataUpdate.slug !== undefined && metadataUpdate.slug !== existing.slug) {
		const nextSlug = metadataUpdate.slug as string;
		for (const namespace of await namespacesOf(db, id)) {
			if (await isSlugTaken(db, nextSlug, namespace, id)) {
				throw new SlugConflictError(nextSlug, await namespaceLabel(db, namespace));
			}
		}
	}
	if (input.description !== undefined) metadataUpdate.description = input.description;
	if (input.usage !== undefined) metadataUpdate.usage = input.usage;
	if (input.stack !== undefined) metadataUpdate.stack = input.stack;
	if (input.layer !== undefined) metadataUpdate.layer = input.layer;
	if (input.source !== undefined) metadataUpdate.source = input.source;
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
		if (!newVersion) throw new Error('Insert blueprint version failed');

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
			logger.error({ err }, 'Failed to generate embedding for updated blueprint');
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
	const { page, limit, stack, layer, tag, projectId, project, authorId } = input;
	const offset = (page - 1) * limit;

	// Resolve project slug to UUID if needed
	let resolvedProjectId = projectId;
	if (!resolvedProjectId && project) {
		const [p] = await db
			.select({ id: projects.id })
			.from(projects)
			.where(eq(projects.slug, project))
			.limit(1);
		resolvedProjectId = p?.id;
	}

	const conditions = [];
	if (stack) conditions.push(eq(blueprints.stack, stack));
	if (layer) conditions.push(eq(blueprints.layer, layer));
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
			authorImage: users.image,
		})
		.from(blueprints)
		.leftJoin(users, eq(blueprints.authorId, users.id))
		.$dynamic();

	if (resolvedProjectId) {
		query = query.innerJoin(
			blueprintProjects,
			and(
				eq(blueprints.id, blueprintProjects.blueprintId),
				eq(blueprintProjects.projectId, resolvedProjectId),
			),
		);
	}

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
	if (resolvedProjectId) {
		countQ = countQ.innerJoin(
			blueprintProjects,
			and(
				eq(blueprints.id, blueprintProjects.blueprintId),
				eq(blueprintProjects.projectId, resolvedProjectId),
			),
		);
	}
	if (tag) {
		countQ = countQ
			.innerJoin(blueprintTags, eq(blueprints.id, blueprintTags.blueprintId))
			.innerJoin(tags, and(eq(blueprintTags.tagId, tags.id), eq(tags.name, tag)));
	}
	if (where) countQ = countQ.where(where);

	const [countResult] = await countQ;
	const total = countResult?.total ?? 0;

	return { items, total, page, limit };
}

/**
 * Finds a blueprint by UUID, or by slug. A slug is only unique within a
 * namespace, so a slug lookup is scoped by `project` (slug or UUID); without
 * it, the lookup succeeds only when a single blueprint carries the slug and
 * throws an AmbiguousSlugError (409) otherwise.
 */
async function findBlueprint(db: DB, id: string, project?: string) {
	if (UUID_RE.test(id)) {
		const [bp] = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);
		return bp ?? null;
	}

	if (project !== undefined) {
		const projectId = await resolveProjectId(db, project);
		if (!projectId) return null;
		const [row] = await db
			.select({ blueprint: blueprints })
			.from(blueprints)
			.innerJoin(
				blueprintProjects,
				and(
					eq(blueprintProjects.blueprintId, blueprints.id),
					eq(blueprintProjects.projectId, projectId),
				),
			)
			.where(eq(blueprints.slug, id))
			.limit(1);
		return row?.blueprint ?? null;
	}

	const rows = await db.select().from(blueprints).where(eq(blueprints.slug, id));
	const candidates = await Promise.all(
		rows.map(async (bp) => ({
			id: bp.id,
			projectSlugs: (await projectRowsOf(db, bp.id)).map((p) => p.slug),
		})),
	);
	const picked = pickSlugCandidate(id, candidates);
	return rows.find((bp) => bp.id === picked?.id) ?? null;
}

export async function getBlueprintById(db: DB, id: string, project?: string) {
	const blueprint = await findBlueprint(db, id, project);
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
		.where(eq(blueprintTags.blueprintId, blueprint.id));

	const blueprintProjectRows = await projectRowsOf(db, blueprint.id);

	return {
		...blueprint,
		author: author ?? null,
		currentVersion,
		tags: blueprintTagRows,
		projects: blueprintProjectRows,
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
