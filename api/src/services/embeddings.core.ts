/**
 * Pure functions for embedding text preparation.
 * No I/O — 100% test coverage required.
 */

const MAX_EMBEDDING_TEXT_LENGTH = 8000;

export function prepareEmbeddingText(parts: {
	description?: string | null;
	usage?: string | null;
	content: string;
}): string {
	const sections = [parts.description, parts.usage, parts.content].filter(
		(s): s is string => !!s && s.trim().length > 0,
	);
	const combined = sections.join('\n\n');
	if (combined.length <= MAX_EMBEDDING_TEXT_LENGTH) {
		return combined;
	}
	return combined.slice(0, MAX_EMBEDDING_TEXT_LENGTH);
}

export function cosineSimilarityToScore(distance: number): number {
	return Math.round((1 - distance) * 100) / 100;
}
