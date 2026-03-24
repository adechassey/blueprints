import { describe, expect, it } from 'vitest';
import { type FlatComment, nestComments } from './comments.core.js';

const makeComment = (overrides: Partial<FlatComment> = {}): FlatComment => ({
	id: 'c1',
	parentId: null,
	content: 'Test comment',
	authorId: 'u1',
	authorName: 'Alice',
	authorImage: null,
	createdAt: '2026-01-01T00:00:00Z',
	updatedAt: '2026-01-01T00:00:00Z',
	...overrides,
});

describe('nestComments', () => {
	it('returns empty array for empty input', () => {
		expect(nestComments([])).toEqual([]);
	});

	it('groups top-level comments with no replies', () => {
		const comments = [makeComment({ id: 'c1' }), makeComment({ id: 'c2' })];
		const result = nestComments(comments);
		expect(result).toHaveLength(2);
		expect(result[0].replies).toEqual([]);
		expect(result[1].replies).toEqual([]);
	});

	it('nests replies under their parent', () => {
		const comments = [
			makeComment({ id: 'c1' }),
			makeComment({ id: 'c2', parentId: 'c1', content: 'Reply to c1' }),
			makeComment({ id: 'c3', parentId: 'c1', content: 'Another reply' }),
		];
		const result = nestComments(comments);
		expect(result).toHaveLength(1);
		expect(result[0].replies).toHaveLength(2);
		expect(result[0].replies[0].id).toBe('c2');
		expect(result[0].replies[1].id).toBe('c3');
	});

	it('handles orphaned replies (parent not in list)', () => {
		const comments = [
			makeComment({ id: 'c1' }),
			makeComment({ id: 'c2', parentId: 'missing-parent' }),
		];
		const result = nestComments(comments);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('c1');
		expect(result[0].replies).toEqual([]);
	});

	it('handles multiple parents with replies', () => {
		const comments = [
			makeComment({ id: 'c1' }),
			makeComment({ id: 'c2' }),
			makeComment({ id: 'r1', parentId: 'c1' }),
			makeComment({ id: 'r2', parentId: 'c2' }),
		];
		const result = nestComments(comments);
		expect(result).toHaveLength(2);
		expect(result[0].replies).toHaveLength(1);
		expect(result[1].replies).toHaveLength(1);
	});
});
