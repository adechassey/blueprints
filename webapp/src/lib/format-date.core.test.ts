import { describe, expect, it } from 'vitest';
import { formatDate } from './format-date.core.js';

describe('formatDate', () => {
	it('formats an ISO timestamp as a medium date in the given locale', () => {
		expect(formatDate('2026-09-17T12:00:00Z', 'en')).toBe('Sep 17, 2026');
	});

	it('follows the locale', () => {
		expect(formatDate('2026-09-17T12:00:00Z', 'fr')).toBe('17 sept. 2026');
	});

	it('accepts a Date', () => {
		expect(formatDate(new Date('2026-01-05T12:00:00Z'), 'en-GB')).toBe('5 Jan 2026');
	});
});
