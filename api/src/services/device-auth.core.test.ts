import { describe, expect, it } from 'vitest';
import { generateUserCode, isValidUserCode, resolvePollingResult } from './device-auth.core.js';

describe('generateUserCode', () => {
	it('generates a code formatted as XXXX-XXXX', () => {
		const code = generateUserCode();
		expect(code).toMatch(/^[^-]{4}-[^-]{4}$/);
	});

	it('only uses unambiguous alphabet characters', () => {
		const code = generateUserCode().replace('-', '');
		for (const char of code) {
			expect('BCDFGHJKLMNPQRSTVWXZ').toContain(char);
		}
	});
});

describe('isValidUserCode', () => {
	it('accepts a valid code', () => {
		expect(isValidUserCode('BCDF-GHJK')).toBe(true);
	});

	it('rejects wrong length', () => {
		expect(isValidUserCode('ABC-DEFG')).toBe(false);
		expect(isValidUserCode('ABCDE-FGH')).toBe(false);
	});

	it('rejects ambiguous characters', () => {
		expect(isValidUserCode('B1CD-EFGH')).toBe(false);
		expect(isValidUserCode('BCDF-EF0H')).toBe(false);
	});

	it('rejects characters outside the alphabet', () => {
		expect(isValidUserCode('abcd-efgh')).toBe(false);
		expect(isValidUserCode('BC@D-EFGH')).toBe(false);
	});
});

describe('resolvePollingResult', () => {
	const expiresAt = new Date('2026-01-01T12:00:00Z');
	const before = new Date('2026-01-01T11:59:00Z');
	const after = new Date('2026-01-01T12:01:00Z');

	it('returns the token when approved', () => {
		expect(resolvePollingResult('approved', 'tok', expiresAt, before)).toEqual({
			status: 'approved',
			token: 'tok',
		});
	});

	it('returns authorization_pending when pending', () => {
		expect(resolvePollingResult('pending', null, expiresAt, before)).toEqual({
			status: 'authorization_pending',
		});
	});

	it('returns slow_down when polling faster than the interval', () => {
		expect(resolvePollingResult('pending', null, expiresAt, before, 2, 1)).toEqual({
			status: 'slow_down',
		});
	});

	it('returns expired_token past expiry', () => {
		expect(resolvePollingResult('pending', null, expiresAt, after)).toEqual({
			status: 'expired_token',
		});
		expect(resolvePollingResult('approved', 'tok', expiresAt, after)).toEqual({
			status: 'expired_token',
		});
	});

	it('returns access_denied when denied', () => {
		expect(resolvePollingResult('denied', null, expiresAt, before)).toEqual({
			status: 'access_denied',
		});
	});

	it('accepts string dates', () => {
		expect(resolvePollingResult('approved', 'tok', expiresAt.toISOString(), before)).toEqual({
			status: 'approved',
			token: 'tok',
		});
	});

	it('returns authorization_pending when approved but token missing', () => {
		expect(resolvePollingResult('approved', null, expiresAt, before)).toEqual({
			status: 'authorization_pending',
		});
	});
});
