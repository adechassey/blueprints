import type { BlueprintLayer } from '@blueprints/shared';
import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import {
	blueprintProjects,
	blueprints,
	blueprintTags,
	blueprintTechnologies,
	blueprintVersions,
	projects,
	tags,
	technologies,
	users,
} from '../db/schema.js';
import { logger } from '../lib/logger.js';
import { cosineSimilarityToScore } from './embeddings.core.js';
import { generateEmbedding } from './embeddings.js';

interface SearchFilters {
	technologies?: string[];
	layer?: string;
	tag?: string;
	projectId?: string;
	project?: string;
	limit?: number;
	offset?: number;
}

interface ResolvedFilters {
	technologies?: string[];
	layer?: string;
	tag?: string;
	resolvedProjectId?: string;
	limit: number;
	offset: number;
}

export async function semanticSearch(db: DB, query: string, filters: SearchFilters = {}) {
	const { layer, tag, projectId, project, limit = 20, offset = 0 } = filters;

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

	let queryEmbedding: number[] | null = null;
	try {
		queryEmbedding = await generateEmbedding(query);
	} catch (err) {
		logger.error({ err }, 'Failed to generate query embedding, falling back to text search');
	}

	const resolved: ResolvedFilters = {
		technologies: filters.technologies,
		layer,
		tag,
		resolvedProjectId,
		limit,
		offset,
	};

	if (queryEmbedding) {
		return vectorSearch(db, queryEmbedding, query, resolved);
	}
	return textSearch(db, query, resolved);
}

async function vectorSearch(
	db: DB,
	queryEmbedding: number[],
	query: string,
	filters: ResolvedFilters,
) {
	const { layer, tag, resolvedProjectId, limit, offset } = filters;
	const embeddingStr = `[${queryEmbedding.join(',')}]`;

	const conditions = [sql`${blueprintVersions.embedding} IS NOT NULL`];
	if (filters.technologies && filters.technologies.length > 0) {
		// Any-match: blueprints carrying at least one of the requested technologies
		conditions.push(
			inArray(
				blueprints.id,
				db
					.select({ id: blueprintTechnologies.blueprintId })
					.from(blueprintTechnologies)
					.innerJoin(technologies, eq(blueprintTechnologies.technologyId, technologies.id))
					.where(inArray(technologies.slug, filters.technologies)),
			),
		);
	}
	if (layer) conditions.push(eq(blueprints.layer, layer as BlueprintLayer));

	let baseQuery = db
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
			authorId: blueprints.authorId,
			authorName: users.name,
			authorImage: users.image,
			distance: sql<number>`${blueprintVersions.embedding} <=> ${embeddingStr}::vector`,
		})
		.from(blueprints)
		.innerJoin(blueprintVersions, eq(blueprints.currentVersionId, blueprintVersions.id))
		.leftJoin(users, eq(blueprints.authorId, users.id))
		.$dynamic();

	if (resolvedProjectId) {
		baseQuery = baseQuery.innerJoin(
			blueprintProjects,
			and(
				eq(blueprints.id, blueprintProjects.blueprintId),
				eq(blueprintProjects.projectId, resolvedProjectId),
			),
		);
	}

	if (tag) {
		baseQuery = baseQuery
			.innerJoin(blueprintTags, eq(blueprints.id, blueprintTags.blueprintId))
			.innerJoin(tags, and(eq(blueprintTags.tagId, tags.id), eq(tags.name, tag)));
	}

	const where = and(...conditions);
	if (where) baseQuery = baseQuery.where(where);

	const items = await baseQuery
		.orderBy(sql`${blueprintVersions.embedding} <=> ${embeddingStr}::vector`)
		.limit(limit)
		.offset(offset);

	const results = items.map((item) => ({
		...item,
		score: cosineSimilarityToScore(item.distance),
	}));

	return { items: results, total: results.length, query };
}

async function textSearch(db: DB, query: string, filters: ResolvedFilters) {
	const { layer, tag, resolvedProjectId, limit, offset } = filters;
	const pattern = `%${query}%`;

	const conditions = [or(ilike(blueprints.name, pattern), ilike(blueprints.description, pattern))];
	if (filters.technologies && filters.technologies.length > 0) {
		// Any-match: blueprints carrying at least one of the requested technologies
		conditions.push(
			inArray(
				blueprints.id,
				db
					.select({ id: blueprintTechnologies.blueprintId })
					.from(blueprintTechnologies)
					.innerJoin(technologies, eq(blueprintTechnologies.technologyId, technologies.id))
					.where(inArray(technologies.slug, filters.technologies)),
			),
		);
	}
	if (layer) conditions.push(eq(blueprints.layer, layer as BlueprintLayer));

	let baseQuery = db
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
			authorId: blueprints.authorId,
			authorName: users.name,
			authorImage: users.image,
		})
		.from(blueprints)
		.leftJoin(users, eq(blueprints.authorId, users.id))
		.$dynamic();

	if (resolvedProjectId) {
		baseQuery = baseQuery.innerJoin(
			blueprintProjects,
			and(
				eq(blueprints.id, blueprintProjects.blueprintId),
				eq(blueprintProjects.projectId, resolvedProjectId),
			),
		);
	}

	if (tag) {
		baseQuery = baseQuery
			.innerJoin(blueprintTags, eq(blueprints.id, blueprintTags.blueprintId))
			.innerJoin(tags, and(eq(blueprintTags.tagId, tags.id), eq(tags.name, tag)));
	}

	const where = and(...conditions);
	if (where) baseQuery = baseQuery.where(where);

	const items = await baseQuery.limit(limit).offset(offset);

	const results = items.map((item) => ({
		...item,
		score: null as number | null,
	}));

	return { items: results, total: results.length, query };
}
