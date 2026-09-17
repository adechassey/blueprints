import { describe, expect, it } from 'vitest';
import { normalizeReferences, parseList, technologyName } from './technologies.core.js';

const catalog = [
	{ name: 'React', slug: 'react' },
	{ name: 'Node.js', slug: 'node' },
];

describe('parseList', () => {
	it('splits and trims a comma-separated list', () => {
		expect(parseList(' react, hono ,,drizzle ')).toEqual(['react', 'hono', 'drizzle']);
	});

	it('returns an empty list for a missing or blank value', () => {
		expect(parseList(undefined)).toEqual([]);
		expect(parseList(' ')).toEqual([]);
	});
});

describe('normalizeReferences', () => {
	it('maps slugs and names (any case) to the catalog slug, without duplicates', () => {
		expect(normalizeReferences(['React', 'react', 'node.js', 'NODE'], catalog)).toEqual([
			'react',
			'node',
		]);
	});

	it('keeps unknown references trimmed and drops blank ones', () => {
		expect(normalizeReferences([' Deno ', ' ', 'react'], catalog)).toEqual(['Deno', 'react']);
	});
});

describe('technologyName', () => {
	it('returns the catalog name for a known reference', () => {
		expect(technologyName('node', catalog)).toBe('Node.js');
	});

	it('returns the reference itself when unknown', () => {
		expect(technologyName('Deno', catalog)).toBe('Deno');
	});
});
