import { describe, expect, it } from 'vitest';
import { groupByLayer, toLayer } from './layers.core.js';

describe('toLayer', () => {
	it('keeps known layers', () => {
		expect(toLayer('database')).toBe('database');
		expect(toLayer('tooling')).toBe('tooling');
	});

	it('rejects legacy, unknown and non-string values', () => {
		expect(toLayer('service')).toBeUndefined();
		expect(toLayer('API')).toBeUndefined();
		expect(toLayer(undefined)).toBeUndefined();
		expect(toLayer(42)).toBeUndefined();
	});
});

describe('groupByLayer', () => {
	it('groups in canonical order, keeping input order within a layer', () => {
		const groups = groupByLayer([
			{ id: 'a', layer: 'ui' },
			{ id: 'b', layer: 'database' },
			{ id: 'c', layer: 'ui' },
			{ id: 'd', layer: 'api' },
		]);
		expect(groups).toEqual([
			{ layer: 'database', items: [{ id: 'b', layer: 'database' }] },
			{ layer: 'api', items: [{ id: 'd', layer: 'api' }] },
			{
				layer: 'ui',
				items: [
					{ id: 'a', layer: 'ui' },
					{ id: 'c', layer: 'ui' },
				],
			},
		]);
	});

	it('drops items with an unknown layer', () => {
		expect(groupByLayer([{ layer: 'service' }])).toEqual([]);
	});
});
