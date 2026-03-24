import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getAdminEmails, isDefaultAdmin } from './admin.core.js';

describe('getAdminEmails', () => {
	const originalEnv = process.env.ADMIN_EMAILS;

	afterEach(() => {
		if (originalEnv !== undefined) {
			process.env.ADMIN_EMAILS = originalEnv;
		} else {
			delete process.env.ADMIN_EMAILS;
		}
	});

	it('returns empty array when ADMIN_EMAILS not set', () => {
		delete process.env.ADMIN_EMAILS;
		expect(getAdminEmails()).toEqual([]);
	});

	it('returns empty array for empty string', () => {
		process.env.ADMIN_EMAILS = '';
		expect(getAdminEmails()).toEqual([]);
	});

	it('parses comma-separated emails', () => {
		process.env.ADMIN_EMAILS = 'alice@test.com,bob@test.com';
		expect(getAdminEmails()).toEqual(['alice@test.com', 'bob@test.com']);
	});

	it('trims whitespace and lowercases', () => {
		process.env.ADMIN_EMAILS = '  Alice@Test.com , Bob@Test.com  ';
		expect(getAdminEmails()).toEqual(['alice@test.com', 'bob@test.com']);
	});
});

describe('isDefaultAdmin', () => {
	const originalEnv = process.env.ADMIN_EMAILS;

	beforeEach(() => {
		process.env.ADMIN_EMAILS = 'admin@test.com,boss@test.com';
	});

	afterEach(() => {
		if (originalEnv !== undefined) {
			process.env.ADMIN_EMAILS = originalEnv;
		} else {
			delete process.env.ADMIN_EMAILS;
		}
	});

	it('returns true for admin email', () => {
		expect(isDefaultAdmin('admin@test.com')).toBe(true);
	});

	it('returns true case-insensitively', () => {
		expect(isDefaultAdmin('ADMIN@TEST.COM')).toBe(true);
	});

	it('returns false for non-admin email', () => {
		expect(isDefaultAdmin('user@test.com')).toBe(false);
	});

	it('returns false when ADMIN_EMAILS is empty', () => {
		process.env.ADMIN_EMAILS = '';
		expect(isDefaultAdmin('admin@test.com')).toBe(false);
	});
});
