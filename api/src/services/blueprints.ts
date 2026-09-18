import { and, count, desc, eq, inArray } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import {
	blueprints,
	blueprintTags,
	blueprintTechnologies,
	blueprintVersions,
	projectMembers,
	projects,
	tags,
	technologies,
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
	UnknownProjectError,
} from './blueprints.core.js';
import { prepareEmbeddingText } from './embeddings.core.js';
import { generateEmbedding } from './embeddings.js';
import { resolveTechnologies, technologiesOfMany } from './technologies.js';

async function upsertTags(db: DB, tagNames: string[]) {
	const normalized = [...new Set(tagNames.map(normalizeTagName).filter(Boolean))];
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

/** Resolves a project given as a UUID or a slug to its id (null when unknown). */
async function resolveProjectId(db: DB, project: string): Promise<string | null> {
	const condition = UUID_RE.test(project) ? eq(projects.id, project) : eq(projects.slug, project);
	const [p] = await db.select({ id: projects.id }).from(projects).where(condition).limit(1);
	return p?.id ?? null;
}

/** The project owning a blueprint (id, name, slug). */
async function projectOf(db: DB, projectId: string) {
	const [p] = await db
		.select({ id: projects.id, name: projects.name, slug: projects.slug })
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1);
	return p ?? null;
}

/** True when a blueprint other than `excludeId` already uses `slug` in the project. */
async function isSlugTaken(
	db: DB,
	slug: string,
	projectId: string,
	excludeId?: string,
): Promise<boolean> {
	const rows = await db
		.select({ id: blueprints.id })
		.from(blueprints)
		.where(and(eq(blueprints.slug, slug), eq(blueprints.projectId, projectId)));
	return rows.some((r) => r.id !== excludeId);
}

/** True when the user belongs to the project (admins bypass this check at the route). */
export async function isProjectMember(db: DB, projectId: string, userId: string): Promise<boolean> {
	const [membership] = await db
		.select({ id: projectMembers.id })
		.from(projectMembers)
		.where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
		.limit(1);
	return !!membership;
}

export async function createBlueprint(db: DB, input: CreateBlueprintInput, authorId: string) {
	const project = await projectOf(db, input.projectId);
	if (!project) throw new UnknownProjectError(input.projectId);
	const requested = input.slug ?? generateSlug(input.name);
	const slug = pickSlug({
		requested,
		explicit: input.slug !== undefined,
		taken: await isSlugTaken(db, requested, project.id),
		projectLabel: project.slug,
	});
	// Resolved before any write: an invalid reference must not leave a half-created blueprint
	const technologyRecords = await resolveTechnologies(db, input.technologies ?? []);

	const [blueprint] = await db
		.insert(blueprints)
		.values({
			name: input.name,
			slug,
			description: input.description,
			usage: input.usage,
			layer: input.layer,
			source: input.source,
			authorId,
			projectId: project.id,
			forkedFromId: input.forkedFromId,
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

	if (technologyRecords.length > 0) {
		await db.insert(blueprintTechnologies).values(
			technologyRecords.map((t) => ({
				blueprintId: blueprint.id,
				technologyId: t.id,
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
		const project = existing.projectId ? await projectOf(db, existing.projectId) : null;
		if (project && (await isSlugTaken(db, nextSlug, project.id, id))) {
			throw new SlugConflictError(nextSlug, project.slug);
		}
	}
	if (input.description !== undefined) metadataUpdate.description = input.description;
	if (input.usage !== undefined) metadataUpdate.usage = input.usage;
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

	if (input.technologies !== undefined) {
		// Resolved before unlinking: a failure must not strip the blueprint of its technologies
		const technologyRecords = await resolveTechnologies(db, input.technologies);
		await db.delete(blueprintTechnologies).where(eq(blueprintTechnologies.blueprintId, id));
		if (technologyRecords.length > 0) {
			await db.insert(blueprintTechnologies).values(
				technologyRecords.map((t) => ({
					blueprintId: id,
					technologyId: t.id,
				})),
			);
		}
	}

	const [updated] = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);
	return updated;
}

export async function listBlueprints(db: DB, input: ListBlueprintsInput) {
	const { page, limit, layer, tag, projectId, project, authorId } = input;
	const offset = (page - 1) * limit;

	// Resolve project slug to UUID if needed
	let resolvedProjectId = projectId;
	if (!resolvedProjectId && project) {
		resolvedProjectId = (await resolveProjectId(db, project)) ?? undefined;
	}

	const conditions = [];
	if (resolvedProjectId) conditions.push(eq(blueprints.projectId, resolvedProjectId));
	if (layer) conditions.push(eq(blueprints.layer, layer));
	if (authorId) conditions.push(eq(blueprints.authorId, authorId));
	if (input.techno && input.techno.length > 0) {
		// Any-match: blueprints carrying at least one of the requested technologies
		conditions.push(
			inArray(
				blueprints.id,
				db
					.select({ id: blueprintTechnologies.blueprintId })
					.from(blueprintTechnologies)
					.innerJoin(technologies, eq(blueprintTechnologies.technologyId, technologies.id))
					.where(inArray(technologies.slug, input.techno)),
			),
		);
	}

	let query = db
		.select({
			id: blueprints.id,
			name: blueprints.name,
			slug: blueprints.slug,
			description: blueprints.description,
			usage: blueprints.usage,
			layer: blueprints.layer,
			isPublic: blueprints.isPublic,
			downloadCount: blueprints.downloadCount,
			createdAt: blueprints.createdAt,
			updatedAt: blueprints.updatedAt,
			authorId: blueprints.authorId,
			authorName: users.name,
			authorImage: users.image,
			projectId: blueprints.projectId,
			projectName: projects.name,
			projectSlug: projects.slug,
		})
		.from(blueprints)
		.leftJoin(users, eq(blueprints.authorId, users.id))
		.leftJoin(projects, eq(blueprints.projectId, projects.id))
		.$dynamic();

	if (tag) {
		query = query
			.innerJoin(blueprintTags, eq(blueprints.id, blueprintTags.blueprintId))
			.innerJoin(tags, and(eq(blueprintTags.tagId, tags.id), eq(tags.name, tag)));
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;
	if (where) query = query.where(where);

	const items = await query.orderBy(desc(blueprints.createdAt)).limit(limit).offset(offset);

	// Attach technologies for the page's blueprints (avoids a join in the main query)
	const technologiesByBlueprint = await technologiesOfMany(
		db,
		items.map((i) => i.id),
	);
	const itemsWithTechnologies = items.map((item) => ({
		...item,
		technologies: technologiesByBlueprint.get(item.id) ?? [],
	}));

	const countQuery = db.select({ total: count() }).from(blueprints).$dynamic();

	let countQ = countQuery;
	if (tag) {
		countQ = countQ
			.innerJoin(blueprintTags, eq(blueprints.id, blueprintTags.blueprintId))
			.innerJoin(tags, and(eq(blueprintTags.tagId, tags.id), eq(tags.name, tag)));
	}
	if (where) countQ = countQ.where(where);

	const [countResult] = await countQ;
	const total = countResult?.total ?? 0;

	return { items: itemsWithTechnologies, total, page, limit };
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
		const [bp] = await db
			.select()
			.from(blueprints)
			.where(and(eq(blueprints.slug, id), eq(blueprints.projectId, projectId)))
			.limit(1);
		return bp ?? null;
	}

	const rows = await db.select().from(blueprints).where(eq(blueprints.slug, id));
	const candidates = await Promise.all(
		rows.map(async (bp) => ({
			id: bp.id,
			projectSlugs: bp.projectId ? [(await projectOf(db, bp.projectId))?.slug ?? ''] : [],
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

	const owningProject = blueprint.projectId ? await projectOf(db, blueprint.projectId) : null;

	const [forkedFrom] = blueprint.forkedFromId
		? await db
				.select({
					id: blueprints.id,
					slug: blueprints.slug,
					name: blueprints.name,
					projectSlug: projects.slug,
				})
				.from(blueprints)
				.leftJoin(projects, eq(blueprints.projectId, projects.id))
				.where(eq(blueprints.id, blueprint.forkedFromId))
				.limit(1)
		: [];

	const [forks] = await db
		.select({ total: count() })
		.from(blueprints)
		.where(eq(blueprints.forkedFromId, blueprint.id));

	const blueprintTechnologyRows = await db
		.select({ name: technologies.name, slug: technologies.slug })
		.from(blueprintTechnologies)
		.innerJoin(technologies, eq(blueprintTechnologies.technologyId, technologies.id))
		.where(eq(blueprintTechnologies.blueprintId, blueprint.id));

	return {
		...blueprint,
		author: author ?? null,
		currentVersion,
		tags: blueprintTagRows,
		technologies: blueprintTechnologyRows,
		project: owningProject,
		forkedFrom: forkedFrom ?? null,
		forkCount: forks?.total ?? 0,
		// Kept for CLI releases that still read `projects`; drop once 0.6+ is adopted
		projects: owningProject ? [owningProject] : [],
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

/**
 * Copies a blueprint into another project: same content, metadata, technologies
 * and tags, as a new blueprint with its own version history and a link back to
 * the original. Reuse across projects is a fork, never a shared blueprint.
 */
export async function forkBlueprint(
	db: DB,
	source: { id: string; projectId: string | null },
	targetProjectId: string,
	userId: string,
) {
	const full = await getBlueprintById(db, source.id);
	if (!full) return null;

	// Keep the original slug when it is free in the target project; otherwise let
	// it be generated (and suffixed), so forking twice never fails on the slug
	const slugTaken = await isSlugTaken(db, full.slug, targetProjectId);

	return createBlueprint(
		db,
		{
			name: full.name,
			slug: slugTaken ? undefined : full.slug,
			description: full.description ?? undefined,
			usage: full.usage ?? undefined,
			source: full.source ?? undefined,
			layer: full.layer,
			technologies: full.technologies.map((t) => t.slug),
			tags: full.tags.map((t) => t.name),
			content: full.currentVersion?.content ?? '',
			projectId: targetProjectId,
			forkedFromId: full.id,
			isPublic: true,
		},
		userId,
	);
}
