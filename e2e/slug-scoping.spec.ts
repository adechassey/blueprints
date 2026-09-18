import { expect, test } from '@playwright/test';
import { cleanupE2eData, createTestUser, type TestUser } from './helpers/db.js';

const API_URL = 'http://localhost:3002';

/**
 * Blueprint slugs are unique per project, not globally: two projects may each
 * publish their own `form-field`, and a slug lookup is scoped by `?project=`.
 * Exercised through the HTTP API with a Bearer session token, as the CLI does.
 */
test.describe('Project-scoped slugs (API)', () => {
	let user: TestUser;

	test.beforeEach(async () => {
		user = await createTestUser('Slug Scoper', 'admin');
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('the same slug lives in two projects and lookups are scoped', async ({ request }) => {
		const headers = { Authorization: `Bearer ${user.token}` };
		const stamp = Date.now();
		const slug = `e2e-form-field-${stamp}`;

		const createProject = async (letter: string) => {
			const res = await request.post(`${API_URL}/api/projects`, {
				headers,
				data: { name: `E2E Project ${letter} ${stamp}`, slug: `e2e-${letter}-${stamp}` },
			});
			expect(res.status()).toBe(201);
			return (await res.json()) as { id: string; slug: string };
		};
		const projectA = await createProject('a');
		const projectB = await createProject('b');

		const blueprintPayload = (projectId: string) => ({
			name: `E2E Form Field ${stamp}`,
			slug,
			layer: 'ui',
			content: '# Form field',
			projectId,
		});
		const publish = (projectId: string) =>
			request.post(`${API_URL}/api/blueprints`, { headers, data: blueprintPayload(projectId) });

		// ── Same slug in two projects: both keep it verbatim ──
		const inA = await publish(projectA.id);
		expect(inA.status()).toBe(201);
		const blueprintA = (await inA.json()) as { id: string; slug: string };
		expect(blueprintA.slug).toBe(slug);

		const inB = await publish(projectB.id);
		expect(inB.status()).toBe(201);
		const blueprintB = (await inB.json()) as { id: string; slug: string };
		expect(blueprintB.slug).toBe(slug);
		expect(blueprintB.id).not.toBe(blueprintA.id);

		// ── An explicit slug never silently mutates: a duplicate within a project is a conflict ──
		const duplicate = await publish(projectA.id);
		expect(duplicate.status()).toBe(409);
		expect(((await duplicate.json()) as { error: string }).error).toContain(projectA.slug);

		// ── Lookups: unscoped is ambiguous, scoped resolves within the project ──
		const unscoped = await request.get(`${API_URL}/api/blueprints/${slug}`);
		expect(unscoped.status()).toBe(409);

		const scopedA = await request.get(`${API_URL}/api/blueprints/${slug}?project=${projectA.slug}`);
		expect(scopedA.status()).toBe(200);
		expect(((await scopedA.json()) as { id: string }).id).toBe(blueprintA.id);

		const scopedB = await request.get(`${API_URL}/api/blueprints/${slug}?project=${projectB.id}`);
		expect(scopedB.status()).toBe(200);
		expect(((await scopedB.json()) as { id: string }).id).toBe(blueprintB.id);

		const elsewhere = await request.get(
			`${API_URL}/api/blueprints/${slug}?project=e2e-nope-${stamp}`,
		);
		expect(elsewhere.status()).toBe(404);

		// ── A generated slug (no explicit slug) gets a suffix instead of failing ──
		const { slug: _explicit, ...withoutSlug } = blueprintPayload(projectA.id);
		const generated = await request.post(`${API_URL}/api/blueprints`, {
			headers,
			data: { ...withoutSlug, name: `E2E Form Field ${stamp}` },
		});
		expect(generated.status()).toBe(201);
		expect(((await generated.json()) as { slug: string }).slug).toMatch(
			new RegExp(`^e2e-form-field-${stamp}-[a-z0-9]+$`),
		);

		// ── A blueprint without a project is rejected: ownership is mandatory ──
		const { projectId: _projectId, ...orphan } = blueprintPayload(projectA.id);
		const noProject = await request.post(`${API_URL}/api/blueprints`, {
			headers,
			data: { ...orphan, slug: `${slug}-orphan` },
		});
		expect(noProject.status()).toBe(400);
	});
});
