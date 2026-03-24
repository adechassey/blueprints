import { describe, expect, it } from 'vitest';
import {
	canonicalPair,
	deduplicateMatches,
	isSameSlug,
	MATCH_REASON,
	meetsSemanticThreshold,
	SEMANTIC_MATCH_THRESHOLD,
	similarityToPercent,
} from './matches.core.js';

describe('isSameSlug', () => {
	it('returns true for same slug, different projects', () => {
		expect(isSameSlug({ slug: 'auth', projectId: 'p1' }, { slug: 'auth', projectId: 'p2' })).toBe(
			true,
		);
	});

	it('returns true for same slug, one null project', () => {
		expect(isSameSlug({ slug: 'auth', projectId: null }, { slug: 'auth', projectId: 'p1' })).toBe(
			true,
		);
	});

	it('returns true for same slug, both null projects', () => {
		expect(isSameSlug({ slug: 'auth', projectId: null }, { slug: 'auth', projectId: null })).toBe(
			true,
		);
	});

	it('returns false for same slug, same project', () => {
		expect(isSameSlug({ slug: 'auth', projectId: 'p1' }, { slug: 'auth', projectId: 'p1' })).toBe(
			false,
		);
	});

	it('returns false for different slugs', () => {
		expect(isSameSlug({ slug: 'auth', projectId: 'p1' }, { slug: 'login', projectId: 'p2' })).toBe(
			false,
		);
	});
});

describe('similarityToPercent', () => {
	it('converts 0.72 to 72', () => {
		expect(similarityToPercent(0.72)).toBe(72);
	});

	it('converts 0 to 0', () => {
		expect(similarityToPercent(0)).toBe(0);
	});

	it('converts 1 to 100', () => {
		expect(similarityToPercent(1)).toBe(100);
	});

	it('rounds correctly', () => {
		expect(similarityToPercent(0.675)).toBe(68);
	});
});

describe('meetsSemanticThreshold', () => {
	it('returns true at threshold', () => {
		expect(meetsSemanticThreshold(SEMANTIC_MATCH_THRESHOLD)).toBe(true);
	});

	it('returns true above threshold', () => {
		expect(meetsSemanticThreshold(0.8)).toBe(true);
	});

	it('returns false below threshold', () => {
		expect(meetsSemanticThreshold(0.59)).toBe(false);
	});
});

describe('canonicalPair', () => {
	it('orders smaller first', () => {
		expect(canonicalPair('b', 'a')).toEqual(['a', 'b']);
	});

	it('keeps order when already correct', () => {
		expect(canonicalPair('a', 'b')).toEqual(['a', 'b']);
	});

	it('handles equal ids', () => {
		expect(canonicalPair('x', 'x')).toEqual(['x', 'x']);
	});
});

describe('deduplicateMatches', () => {
	it('deduplicates by canonical pair', () => {
		const result = deduplicateMatches([
			{ blueprintId: 'b', matchedBlueprintId: 'a', reason: 'embedding', score: 70 },
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 65 },
		]);
		expect(result).toHaveLength(1);
		expect(result[0]?.blueprintId).toBe('a');
		expect(result[0]?.score).toBe(70);
	});

	it('prefers slug reason over embedding', () => {
		const result = deduplicateMatches([
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 90 },
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'slug', score: null },
		]);
		expect(result).toHaveLength(1);
		expect(result[0]?.reason).toBe(MATCH_REASON.SLUG);
	});

	it('keeps higher score for same reason', () => {
		const result = deduplicateMatches([
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 60 },
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 80 },
		]);
		expect(result[0]?.score).toBe(80);
	});

	it('replaces existing null-score entry with a scored one', () => {
		const result = deduplicateMatches([
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: null },
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 70 },
		]);
		expect(result[0]?.score).toBe(70);
	});

	it('keeps existing entry when new has null score and existing has a score', () => {
		const result = deduplicateMatches([
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 70 },
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: null },
		]);
		expect(result[0]?.score).toBe(70);
	});

	it('keeps existing entry when it has higher score', () => {
		const result = deduplicateMatches([
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 90 },
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'embedding', score: 60 },
		]);
		expect(result[0]?.score).toBe(90);
	});

	it('handles empty input', () => {
		expect(deduplicateMatches([])).toEqual([]);
	});

	it('preserves distinct pairs', () => {
		const result = deduplicateMatches([
			{ blueprintId: 'a', matchedBlueprintId: 'b', reason: 'slug', score: null },
			{ blueprintId: 'a', matchedBlueprintId: 'c', reason: 'embedding', score: 70 },
		]);
		expect(result).toHaveLength(2);
	});
});
