import { BLUEPRINT_LAYERS } from '@blueprints/shared';
import { describe, expect, it } from 'vitest';
import { isValidLayer, isValidSlug, paginationDefaults } from './validation.core.js';

describe('isValidSlug', () => {
	it('accepts valid slugs', () => {
		expect(isValidSlug('my-project')).toBe(true);
		expect(isValidSlug('a')).toBe(true);
		expect(isValidSlug('test-123')).toBe(true);
	});

	it('rejects invalid slugs', () => {
		expect(isValidSlug('')).toBe(false);
		expect(isValidSlug('My Project')).toBe(false);
		expect(isValidSlug('test_slug')).toBe(false);
		expect(isValidSlug('UPPER')).toBe(false);
	});

	it('rejects slugs over 100 chars', () => {
		expect(isValidSlug('a'.repeat(101))).toBe(false);
	});
});

describe('isValidLayer', () => {
	it('accepts every defined layer', () => {
		for (const layer of BLUEPRINT_LAYERS) {
			expect(isValidLayer(layer)).toBe(true);
		}
	});

	it('rejects invalid layers', () => {
		expect(isValidLayer('invalid')).toBe(false);
		expect(isValidLayer('')).toBe(false);
		expect(isValidLayer('server')).toBe(false);
	});
});

describe('paginationDefaults', () => {
	it('uses defaults when no args', () => {
		expect(paginationDefaults()).toEqual({ page: 1, limit: 20, offset: 0 });
	});

	it('uses provided values', () => {
		expect(paginationDefaults(3, 50)).toEqual({ page: 3, limit: 50, offset: 100 });
	});

	it('clamps page to minimum 1', () => {
		expect(paginationDefaults(0, 20)).toEqual({ page: 1, limit: 20, offset: 0 });
		expect(paginationDefaults(-5, 20)).toEqual({ page: 1, limit: 20, offset: 0 });
	});

	it('clamps limit to 1-100', () => {
		expect(paginationDefaults(1, 0)).toEqual({ page: 1, limit: 1, offset: 0 });
		expect(paginationDefaults(1, 200)).toEqual({ page: 1, limit: 100, offset: 0 });
	});
});
