import { expect, test } from '@playwright/test';
import { cleanupE2eData, createTestUser, query, type TestUser } from './helpers/db.js';

const API_URL = 'http://localhost:3002';

/**
 * Catalog technologies carry a display name distinct from their slug
 * ("Node.js" / "node"). Clients reference them either way — the webapp and
 * `sync --techno` send slugs, hand-written frontmatter sends names — and must
 * land on the catalog row, never on a duplicate.
 */
test.describe('Technology references (API)', () => {
	let user: TestUser;
	let stamp: number;
	let catalog: { name: string; slug: string };

	test.beforeEach(async () => {
		user = await createTestUser('Tech Referencer', 'admin');
		stamp = Date.now();
		// The name slugifies to `e2e-techjs-<stamp>`, not to the catalog slug
		catalog = { name: `E2E Tech.js ${stamp}`, slug: `e2e-tech-${stamp}` };
		await query('INSERT INTO technologies (name, slug) VALUES ($1, $2)', [
			catalog.name,
			catalog.slug,
		]);
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('a blueprint resolves slugs and display names to the catalog row', async ({ request }) => {
		const headers = { Authorization: `Bearer ${user.token}` };

		const created = await request.post(`${API_URL}/api/blueprints`, {
			headers,
			data: {
				name: `E2E Tech Blueprint ${stamp}`,
				layer: 'api',
				content: '# Technology references',
				technologies: [catalog.slug, catalog.name.toLowerCase(), catalog.slug.toUpperCase()],
			},
		});
		expect(created.status()).toBe(201);
		const { id } = (await created.json()) as { id: string };

		const detail = await request.get(`${API_URL}/api/blueprints/${id}`, { headers });
		const body = (await detail.json()) as { technologies: { name: string; slug: string }[] };
		expect(body.technologies).toEqual([catalog]);

		const { rows } = await query<{ n: number }>(
			`SELECT count(*)::int AS n FROM technologies WHERE slug LIKE 'e2e-tech%'`,
		);
		expect(rows[0].n).toBe(1);

		// Updating with the same references keeps a single link
		const updated = await request.put(`${API_URL}/api/blueprints/${id}`, {
			headers,
			data: { technologies: [catalog.name, catalog.slug] },
		});
		expect(updated.status()).toBe(200);
		const after = await request.get(`${API_URL}/api/blueprints/${id}`, { headers });
		expect(((await after.json()) as typeof body).technologies).toEqual([catalog]);
	});

	test('a stack dedupes references and rejects a taken name', async ({ request }) => {
		const headers = { Authorization: `Bearer ${user.token}` };
		const name = `E2E Tech Stack ${stamp}`;

		const created = await request.post(`${API_URL}/api/stacks`, {
			headers,
			data: { name, slug: `e2e-tech-stack-${stamp}`, technologies: [catalog.name, catalog.slug] },
		});
		expect(created.status()).toBe(201);
		const stack = (await created.json()) as { technologies: { slug: string }[] };
		expect(stack.technologies.map((t) => t.slug)).toEqual([catalog.slug]);

		const sameName = await request.post(`${API_URL}/api/stacks`, {
			headers,
			data: { name, slug: `e2e-tech-stack-bis-${stamp}`, technologies: [catalog.slug] },
		});
		expect(sameName.status()).toBe(409);
	});
});
