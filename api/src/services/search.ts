import { and, eq, ilike, or, sql } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { blueprints, blueprintTags, blueprintVersions, tags, users } from '../db/schema.js';
import { logger } from '../lib/logger.js';
import { cosineSimilarityToScore } from './embeddings.core.js';
import { generateEmbedding } from './embeddings.js';

interface SearchFilters {
	stack?: string;
	layer?: string;
	tag?: string;
	projectId?: string;
	limit?: number;
	offset?: number;
}

interface ResolvedFilters {
	stack?: string;
	layer?: string;
	tag?: string;
	projectId?: string;
	limit: number;
	offset: number;
}

export async function semanticSearch(db: DB, query: string, filters: SearchFilters = {}) {
	const { stack, layer, tag, projectId, limit = 20, offset = 0 } = filters;

	let queryEmbedding: number[] | null = null;
	try {
		queryEmbedding = await generateEmbedding(query);
	} catch (err) {
		logger.error({ err }, 'Failed to generate query embedding, falling back to text search');
	}

	if (queryEmbedding) {
		return vectorSearch(db, queryEmbedding, query, { stack, layer, tag, projectId, limit, offset });
	}
	return textSearch(db, query, { stack, layer, tag, projectId, limit, offset });
}

async function vectorSearch(
	db: DB,
	queryEmbedding: number[],
	query: string,
	filters: ResolvedFilters,
) {
	const { stack, layer, tag, projectId, limit, offset } = filters;
	const embeddingStr = `[${queryEmbedding.join(',')}]`;

	const conditions = [sql`${blueprintVersions.embedding} IS NOT NULL`];
	if (stack)
		conditions.push(eq(blueprints.stack, stack as 'server' | 'webapp' | 'shared' | 'fullstack'));
	if (layer) conditions.push(eq(blueprints.layer, layer));
	if (projectId) conditions.push(eq(blueprints.projectId, projectId));

	let baseQuery = db
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
			authorId: blueprints.authorId,
			authorName: users.name,
			projectId: blueprints.projectId,
			distance: sql<number>`${blueprintVersions.embedding} <=> ${embeddingStr}::vector`,
		})
		.from(blueprints)
		.innerJoin(blueprintVersions, eq(blueprints.currentVersionId, blueprintVersions.id))
		.leftJoin(users, eq(blueprints.authorId, users.id))
		.$dynamic();

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
	const { stack, layer, tag, projectId, limit, offset } = filters;
	const pattern = `%${query}%`;

	const conditions = [or(ilike(blueprints.name, pattern), ilike(blueprints.description, pattern))];
	if (stack)
		conditions.push(eq(blueprints.stack, stack as 'server' | 'webapp' | 'shared' | 'fullstack'));
	if (layer) conditions.push(eq(blueprints.layer, layer));
	if (projectId) conditions.push(eq(blueprints.projectId, projectId));

	let baseQuery = db
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
			authorId: blueprints.authorId,
			authorName: users.name,
			projectId: blueprints.projectId,
		})
		.from(blueprints)
		.leftJoin(users, eq(blueprints.authorId, users.id))
		.$dynamic();

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
