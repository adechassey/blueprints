import { describe, expect, it } from 'vitest';
import { dedupeById, toTechnologyRefs } from './technologies.core.js';

describe('toTechnologyRefs', () => {
	it('derives a slug from slugs and display names alike', () => {
		expect(toTechnologyRefs(['react', 'Node.js', ' Tailwind CSS '])).toEqual([
			{ name: 'react', slug: 'react' },
			{ name: 'Node.js', slug: 'nodejs' },
			{ name: 'Tailwind CSS', slug: 'tailwind-css' },
		]);
	});

	it('keeps the first occurrence of a slug', () => {
		expect(toTechnologyRefs(['React', 'react', 'REACT'])).toEqual([
			{ name: 'React', slug: 'react' },
		]);
	});

	it('drops entries that slugify to nothing', () => {
		expect(toTechnologyRefs(['', '  ', '++', 'hono'])).toEqual([{ name: 'hono', slug: 'hono' }]);
	});
});

describe('dedupeById', () => {
	it('keeps the first row per id, in order', () => {
		const rows = [
			{ id: '1', name: 'Node.js' },
			{ id: '2', name: 'React' },
			{ id: '1', name: 'node' },
		];
		expect(dedupeById(rows)).toEqual([
			{ id: '1', name: 'Node.js' },
			{ id: '2', name: 'React' },
		]);
	});
});
