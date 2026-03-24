import { and, eq, ne, or, sql } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { blueprintMatches, blueprints, blueprintVersions, projects, users } from '../db/schema.js';
import { logger } from '../lib/logger.js';
import {
	canonicalPair,
	deduplicateMatches,
	isSameSlug,
	MATCH_REASON,
	similarityToPercent,
} from './matches.core.js';

export async function computeMatchesForBlueprint(db: DB, blueprintId: string) {
	const [bp] = await db
		.select({
			id: blueprints.id,
			slug: blueprints.slug,
			projectId: blueprints.projectId,
			currentVersionId: blueprints.currentVersionId,
		})
		.from(blueprints)
		.where(eq(blueprints.id, blueprintId))
		.limit(1);

	if (!bp) return { newMatches: 0 };

	const candidates: {
		blueprintId: string;
		matchedBlueprintId: string;
		reason: string;
		score: number | null;
	}[] = [];

	// 1. Slug matches — same slug, different project
	const slugCandidates = await db
		.select({ id: blueprints.id, slug: blueprints.slug, projectId: blueprints.projectId })
		.from(blueprints)
		.where(and(eq(blueprints.slug, bp.slug), ne(blueprints.id, bp.id)));

	for (const c of slugCandidates) {
		if (isSameSlug(bp, c)) {
			candidates.push({
				blueprintId: bp.id,
				matchedBlueprintId: c.id,
				reason: MATCH_REASON.SLUG,
				score: null,
			});
		}
	}

	// 2. Embedding matches — cosine similarity > 60%
	if (bp.currentVersionId) {
		const [version] = await db
			.select({ embedding: blueprintVersions.embedding })
			.from(blueprintVersions)
			.where(eq(blueprintVersions.id, bp.currentVersionId))
			.limit(1);

		if (version?.embedding) {
			const embeddingStr = `[${version.embedding.join(',')}]`;
			const similarRows = await db
				.select({
					id: blueprints.id,
					similarity: sql<number>`1 - (${blueprintVersions.embedding} <=> ${embeddingStr}::vector)`,
				})
				.from(blueprints)
				.innerJoin(blueprintVersions, eq(blueprints.currentVersionId, blueprintVersions.id))
				.where(
					and(
						ne(blueprints.id, bp.id),
						sql`${blueprintVersions.embedding} IS NOT NULL`,
						sql`1 - (${blueprintVersions.embedding} <=> ${embeddingStr}::vector) >= 0.6`,
					),
				)
				.orderBy(sql`1 - (${blueprintVersions.embedding} <=> ${embeddingStr}::vector) DESC`)
				.limit(20);

			for (const row of similarRows) {
				candidates.push({
					blueprintId: bp.id,
					matchedBlueprintId: row.id,
					reason: MATCH_REASON.EMBEDDING,
					score: similarityToPercent(row.similarity),
				});
			}
		}
	}

	// 3. Deduplicate and insert
	const deduped = deduplicateMatches(candidates);
	let newMatches = 0;

	for (const match of deduped) {
		const [a, b] = canonicalPair(match.blueprintId, match.matchedBlueprintId);
		try {
			await db
				.insert(blueprintMatches)
				.values({
					blueprintId: a,
					matchedBlueprintId: b,
					reason: match.reason,
					score: match.score,
				})
				.onConflictDoNothing();
			newMatches++;
		} catch (err) {
			logger.error({ err }, 'Failed to insert match');
		}
	}

	return { newMatches };
}

export async function computeAllMatches(db: DB) {
	const allBlueprints = await db.select({ id: blueprints.id }).from(blueprints);
	let totalNew = 0;

	for (const bp of allBlueprints) {
		const result = await computeMatchesForBlueprint(db, bp.id);
		totalNew += result.newMatches;
	}

	return { processed: allBlueprints.length, newMatches: totalNew };
}

export async function getMatchesForBlueprint(db: DB, blueprintId: string) {
	const rows = await db
		.select({
			id: blueprintMatches.id,
			blueprintId: blueprintMatches.blueprintId,
			matchedBlueprintId: blueprintMatches.matchedBlueprintId,
			reason: blueprintMatches.reason,
			score: blueprintMatches.score,
			status: blueprintMatches.status,
			createdAt: blueprintMatches.createdAt,
		})
		.from(blueprintMatches)
		.where(
			and(
				ne(blueprintMatches.status, 'dismissed'),
				or(
					eq(blueprintMatches.blueprintId, blueprintId),
					eq(blueprintMatches.matchedBlueprintId, blueprintId),
				),
			),
		);

	// Enrich with blueprint details for the "other" side
	const enriched = [];
	for (const row of rows) {
		const otherId = row.blueprintId === blueprintId ? row.matchedBlueprintId : row.blueprintId;
		const [other] = await db
			.select({
				id: blueprints.id,
				name: blueprints.name,
				slug: blueprints.slug,
				stack: blueprints.stack,
				layer: blueprints.layer,
				authorName: users.name,
				projectName: projects.name,
			})
			.from(blueprints)
			.leftJoin(users, eq(blueprints.authorId, users.id))
			.leftJoin(projects, eq(blueprints.projectId, projects.id))
			.where(eq(blueprints.id, otherId))
			.limit(1);

		if (other) {
			enriched.push({ ...row, matchedBlueprint: other });
		}
	}

	return enriched;
}

export async function updateMatchStatus(
	db: DB,
	matchId: string,
	status: 'confirmed' | 'dismissed',
	reviewedBy: string,
) {
	const [updated] = await db
		.update(blueprintMatches)
		.set({ status, reviewedBy })
		.where(eq(blueprintMatches.id, matchId))
		.returning();
	return updated ?? null;
}
