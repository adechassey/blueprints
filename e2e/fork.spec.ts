import { expect, test } from '@playwright/test';
import { cleanupE2eData, createTestUser, type TestUser } from './helpers/db.js';

const API_URL = 'http://localhost:3002';

/**
 * A blueprint belongs to exactly one project. Reusing another project's
 * blueprint copies it into yours — it becomes your own blueprint, with its own
 * version history and a link back to where it came from.
 */
test.describe('Forking (API)', () => {
	let user: TestUser;

	test.beforeEach(async () => {
		user = await createTestUser('Forker', 'admin');
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('forks a blueprint into another project, twice', async ({ request }) => {
		const headers = { Authorization: `Bearer ${user.token}` };
		const stamp = Date.now();

		const createProject = async (letter: string) => {
			const res = await request.post(`${API_URL}/api/projects`, {
				headers,
				data: { name: `E2E Project ${letter} ${stamp}`, slug: `e2e-${letter}-${stamp}` },
			});
			expect(res.status()).toBe(201);
			return (await res.json()) as { id: string; slug: string };
		};
		const source = await createProject('src');
		const target = await createProject('dst');

		const published = await request.post(`${API_URL}/api/blueprints`, {
			headers,
			data: {
				name: `E2E Forkable ${stamp}`,
				slug: `e2e-forkable-${stamp}`,
				layer: 'ui',
				content: '# Original',
				technologies: ['react'],
				tags: ['forking'],
				projectId: source.id,
			},
		});
		expect(published.status()).toBe(201);
		const original = (await published.json()) as { id: string; slug: string };

		// ── The fork is a copy owned by the target project ──
		const forked = await request.post(`${API_URL}/api/blueprints/${original.id}/fork`, {
			headers,
			data: { projectId: target.id },
		});
		expect(forked.status()).toBe(201);
		const fork = (await forked.json()) as { id: string; slug: string };
		expect(fork.id).not.toBe(original.id);
		expect(fork.slug).toBe(original.slug);

		const detail = (await (
			await request.get(`${API_URL}/api/blueprints/${fork.id}`, { headers })
		).json()) as {
			project: { slug: string };
			forkedFrom: { id: string; projectSlug: string } | null;
			technologies: { slug: string }[];
			tags: { name: string }[];
			currentVersion: { content: string; version: number };
		};
		expect(detail.project.slug).toBe(target.slug);
		expect(detail.forkedFrom?.id).toBe(original.id);
		expect(detail.forkedFrom?.projectSlug).toBe(source.slug);
		expect(detail.technologies.map((t) => t.slug)).toEqual(['react']);
		expect(detail.tags.map((t) => t.name)).toEqual(['forking']);
		expect(detail.currentVersion.content).toBe('# Original');
		expect(detail.currentVersion.version).toBe(1);

		// ── Editing the fork leaves the original untouched ──
		await request.put(`${API_URL}/api/blueprints/${fork.id}`, {
			headers,
			data: { content: '# Ours now' },
		});
		const originalAfter = (await (
			await request.get(`${API_URL}/api/blueprints/${original.id}`, { headers })
		).json()) as { currentVersion: { content: string }; forkCount: number };
		expect(originalAfter.currentVersion.content).toBe('# Original');
		expect(originalAfter.forkCount).toBe(1);

		// ── Forking again into the same project keeps both, under a suffixed slug ──
		const second = await request.post(`${API_URL}/api/blueprints/${original.id}/fork`, {
			headers,
			data: { projectId: target.id },
		});
		expect(second.status()).toBe(201);
		expect(((await second.json()) as { slug: string }).slug).not.toBe(original.slug);
	});

	test('refuses to fork into a project the user does not belong to', async ({ request }) => {
		const stamp = Date.now();
		const owner = await createTestUser('Fork Owner', 'user');
		const outsider = await createTestUser('Fork Outsider', 'user');

		const project = (await (
			await request.post(`${API_URL}/api/projects`, {
				headers: { Authorization: `Bearer ${owner.token}` },
				data: { name: `E2E Project own ${stamp}`, slug: `e2e-own-${stamp}` },
			})
		).json()) as { id: string };

		const blueprint = (await (
			await request.post(`${API_URL}/api/blueprints`, {
				headers: { Authorization: `Bearer ${owner.token}` },
				data: {
					name: `E2E Guarded ${stamp}`,
					layer: 'ui',
					content: '# Guarded',
					projectId: project.id,
				},
			})
		).json()) as { id: string };

		const refused = await request.post(`${API_URL}/api/blueprints/${blueprint.id}/fork`, {
			headers: { Authorization: `Bearer ${outsider.token}` },
			data: { projectId: project.id },
		});
		expect(refused.status()).toBe(403);
	});
});
