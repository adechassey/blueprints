/**
 * Pure business logic for blueprint matching.
 * No I/O — 100% test coverage required.
 */

/** Minimum cosine similarity (0-1) to consider a semantic match */
export const SEMANTIC_MATCH_THRESHOLD = 0.6;

export const MATCH_REASON = {
	SLUG: 'slug',
	EMBEDDING: 'embedding',
} as const;

/** Returns true if two blueprints share a slug across different projects. */
export function isSameSlug(
	a: { slug: string; projectId: string | null },
	b: { slug: string; projectId: string | null },
): boolean {
	if (a.slug !== b.slug) return false;
	if (a.projectId !== null && a.projectId === b.projectId) return false;
	return true;
}

/** Converts a cosine similarity score (0-1) to an integer percentage (0-100). */
export function similarityToPercent(score: number): number {
	return Math.round(score * 100);
}

/** Returns true if the similarity score meets the semantic match threshold. */
export function meetsSemanticThreshold(score: number): boolean {
	return score >= SEMANTIC_MATCH_THRESHOLD;
}

/** Orders a pair of IDs deterministically so we store each pair once. */
export function canonicalPair(idA: string, idB: string): [string, string] {
	return idA < idB ? [idA, idB] : [idB, idA];
}

interface MatchCandidate {
	blueprintId: string;
	matchedBlueprintId: string;
	reason: string;
	score: number | null;
}

/** Deduplicates match candidates by canonical pair, keeping the best entry per pair. */
export function deduplicateMatches(candidates: MatchCandidate[]): MatchCandidate[] {
	const seen = new Map<string, MatchCandidate>();
	for (const c of candidates) {
		const [a, b] = canonicalPair(c.blueprintId, c.matchedBlueprintId);
		const key = `${a}:${b}`;
		const existing = seen.get(key);
		// Slug matches take priority, otherwise keep the higher score
		if (!existing || c.reason === MATCH_REASON.SLUG || (c.score ?? 0) > (existing.score ?? 0)) {
			seen.set(key, { ...c, blueprintId: a, matchedBlueprintId: b });
		}
	}
	return Array.from(seen.values());
}
