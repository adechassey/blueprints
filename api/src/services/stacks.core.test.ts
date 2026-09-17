import { describe, expect, it } from 'vitest';
import { groupBlueprintsByLayer, type StackBlueprint } from './stacks.core.js';

function bp(overrides: Partial<StackBlueprint>): StackBlueprint {
	return {
		slug: 'test',
		name: 'Test',
		layer: 'domain',
		description: null,
		technologies: [],
		projects: [],
		content: '# content',
		...overrides,
	};
}

describe('groupBlueprintsByLayer', () => {
	it('groups blueprints by layer in canonical order', () => {
		const groups = groupBlueprintsByLayer([
			bp({ slug: 'a', layer: 'ui' }),
			bp({ slug: 'b', layer: 'database' }),
			bp({ slug: 'c', layer: 'api' }),
			bp({ slug: 'd', layer: 'ui' }),
		]);

		expect(groups.map((g) => g.layer)).toEqual(['database', 'api', 'ui']);
		expect(groups[2]?.blueprints.map((b) => b.slug)).toEqual(['a', 'd']);
	});

	it('puts unknown layers last, in encounter order', () => {
		const groups = groupBlueprintsByLayer([
			bp({ slug: 'a', layer: 'custom' }),
			bp({ slug: 'b', layer: 'domain' }),
			bp({ slug: 'c', layer: 'other' }),
		]);

		expect(groups.map((g) => g.layer)).toEqual(['domain', 'custom', 'other']);
	});

	it('returns an empty array for no blueprints', () => {
		expect(groupBlueprintsByLayer([])).toEqual([]);
	});
});
