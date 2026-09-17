import { describe, expect, it } from 'vitest';
import { toLayer } from './layers.core.js';

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
