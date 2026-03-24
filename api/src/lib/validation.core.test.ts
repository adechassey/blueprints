import { describe, expect, it } from 'vitest';
import { isValidSlug, isValidStack, paginationDefaults } from './validation.core.js';

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

describe('isValidStack', () => {
	it('accepts valid stacks', () => {
		expect(isValidStack('server')).toBe(true);
		expect(isValidStack('webapp')).toBe(true);
		expect(isValidStack('shared')).toBe(true);
		expect(isValidStack('fullstack')).toBe(true);
	});

	it('rejects invalid stacks', () => {
		expect(isValidStack('invalid')).toBe(false);
		expect(isValidStack('')).toBe(false);
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
