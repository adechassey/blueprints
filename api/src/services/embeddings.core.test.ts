import { describe, expect, it } from 'vitest';
import { cosineSimilarityToScore, prepareEmbeddingText } from './embeddings.core.js';

describe('prepareEmbeddingText', () => {
	it('concatenates all parts', () => {
		const result = prepareEmbeddingText({
			description: 'A great blueprint',
			usage: 'Use it for testing',
			content: '# Code here',
		});
		expect(result).toBe('A great blueprint\n\nUse it for testing\n\n# Code here');
	});

	it('handles null description', () => {
		const result = prepareEmbeddingText({
			description: null,
			usage: 'Use it',
			content: 'Content',
		});
		expect(result).toBe('Use it\n\nContent');
	});

	it('handles null usage', () => {
		const result = prepareEmbeddingText({
			description: 'Desc',
			usage: null,
			content: 'Content',
		});
		expect(result).toBe('Desc\n\nContent');
	});

	it('handles all null optional fields', () => {
		const result = prepareEmbeddingText({
			content: 'Just content',
		});
		expect(result).toBe('Just content');
	});

	it('skips empty strings', () => {
		const result = prepareEmbeddingText({
			description: '',
			usage: '  ',
			content: 'Content',
		});
		expect(result).toBe('Content');
	});

	it('truncates long text to 8000 chars', () => {
		const longContent = 'x'.repeat(10000);
		const result = prepareEmbeddingText({ content: longContent });
		expect(result.length).toBe(8000);
	});

	it('does not truncate short text', () => {
		const result = prepareEmbeddingText({ content: 'short' });
		expect(result).toBe('short');
	});
});

describe('cosineSimilarityToScore', () => {
	it('converts distance 0 to score 1', () => {
		expect(cosineSimilarityToScore(0)).toBe(1);
	});

	it('converts distance 1 to score 0', () => {
		expect(cosineSimilarityToScore(1)).toBe(0);
	});

	it('converts distance 0.3 to score 0.7', () => {
		expect(cosineSimilarityToScore(0.3)).toBe(0.7);
	});

	it('rounds to 2 decimal places', () => {
		expect(cosineSimilarityToScore(0.333)).toBe(0.67);
	});
});
