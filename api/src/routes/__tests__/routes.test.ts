import { describe, expect, it } from 'vitest';
import { app } from '../../app.js';

describe('route paths', () => {
	it('never end in /index, which the Hono client strips from the URLs it builds', () => {
		const offending = app.routes.filter((route) => /\/index$/.test(route.path));
		expect(offending.map((route) => `${route.method} ${route.path}`)).toEqual([]);
	});
});
