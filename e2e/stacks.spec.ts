import { expect, test } from '@playwright/test';
import {
	cleanupE2eData,
	createTestUser,
	query,
	seedBlueprint,
	seedProject,
	type TestUser,
} from './helpers/db.js';

const API_URL = 'http://localhost:3002';

/**
 * Stacks are named technology presets. The key endpoint is
 * GET /stacks/:id/blueprints: every blueprint carrying at least one stack
 * technology, with its current version content, grouped by architecture
 * layer — the feed for the CLI `stack scaffold` command.
 */
test.describe('Stacks (API)', () => {
	let user: TestUser;

	test.beforeEach(async () => {
		user = await createTestUser('Stack Builder', 'admin');
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('create, read and scaffold-feed a stack', async ({ request }) => {
		const headers = { Authorization: `Bearer ${user.token}` };
		const stamp = Date.now();

		// ── Create a stack referencing existing + unknown technology slugs ──
		const stackName = `E2E Stack ${stamp}`;
		const created = await request.post(`${API_URL}/api/stacks`, {
			headers,
			data: {
				name: stackName,
				slug: `e2e-stack-${stamp}`,
				description: 'Stack used by the E2E suite',
				technologies: ['react', 'hono', 'made-up-tech'],
			},
		});
		expect(created.status()).toBe(201);
		const stack = (await created.json()) as {
			id: string;
			slug: string;
			technologies: { slug: string }[];
		};
		const techSlugs = stack.technologies.map((t) => t.slug).sort();
		expect(techSlugs).toEqual(['hono', 'made-up-tech', 'react']);

		// ── Blueprint with a stack technology appears in the scaffold feed ──
		const bp = await seedBlueprint(user.id, {
			name: 'E2E Layered',
			layer: 'api',
			content: '# E2E layered blueprint',
		});
		// Link the blueprint to two of the stack's technologies (react + hono)
		await query(
			`INSERT INTO blueprint_technologies (blueprint_id, technology_id)
			 SELECT $1, t.id FROM technologies t WHERE t.slug IN ('react', 'hono')`,
			[bp.id],
		);
		const feed = await request.get(`${API_URL}/api/stacks/${stack.slug}/blueprints`);
		expect(feed.status()).toBe(200);
		const body = (await feed.json()) as {
			stack: { slug: string };
			layers: {
				layer: string;
				blueprints: { slug: string; content: string; projects: string[] }[];
			}[];
		};
		const apiLayer = body.layers.find((l) => l.layer === 'api');
		const found = apiLayer?.blueprints.find((b) => b.slug.startsWith('e2e-e2e-layered'));
		expect(found).toBeDefined();
		expect(found?.content).toBe('# E2E layered blueprint');
		// Project slugs let the scaffold tell apart blueprints sharing a slug
		expect(found?.projects).toEqual([(await seedProject(user.id)).slug]);

		// ── Duplicate slug is rejected with 409 ──
		const duplicate = await request.post(`${API_URL}/api/stacks`, {
			headers,
			data: {
				name: `${stackName} bis`,
				slug: `e2e-stack-${stamp}`,
				technologies: ['react'],
			},
		});
		expect(duplicate.status()).toBe(409);

		// ── Delete ──
		const removed = await request.delete(`${API_URL}/api/stacks/${stack.slug}`, { headers });
		expect(removed.status()).toBe(200);
		const gone = await request.get(`${API_URL}/api/stacks/${stack.slug}`);
		expect(gone.status()).toBe(404);
	});
});
