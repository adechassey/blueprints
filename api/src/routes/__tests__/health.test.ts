import { describe, expect, it } from 'vitest';
import { app } from '../../app.js';

describe('GET /api/health', () => {
	it('returns status ok', async () => {
		const res = await app.request('/api/health');
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ status: 'ok' });
	});
});

describe('error handling', () => {
	it('returns 404 for unknown routes', async () => {
		const res = await app.request('/api/unknown');
		expect(res.status).toBe(404);
	});
});
