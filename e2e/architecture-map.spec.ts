import { expect, test } from '@playwright/test';
import { authenticate } from './helpers/auth.js';
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
 * A project's architecture map: a single zone by default, zones resolved
 * from blueprint technologies once the project's creator configures them.
 */
test.describe('Project architecture map', () => {
	let owner: TestUser;
	let stamp: number;
	let project: { id: string; slug: string };
	let techSlug: string;

	test.beforeEach(async () => {
		owner = await createTestUser('Map Owner', 'user');
		stamp = Date.now();
		project = await seedProject(owner.id);
		techSlug = `e2e-tech-map-${stamp}`;
		await query('INSERT INTO technologies (name, slug, category) VALUES ($1, $2, $3)', [
			`E2E Map Tech ${stamp}`,
			techSlug,
			'framework',
		]);
		const page = await seedBlueprint(owner.id, {
			name: `E2E Map Page ${stamp}`,
			description: 'Web page fixture',
			content: '# Page',
			layer: 'ui',
			projectId: project.id,
		});
		await seedBlueprint(owner.id, {
			name: `E2E Map Endpoint ${stamp}`,
			description: 'Server endpoint fixture',
			content: '# Endpoint',
			layer: 'api',
			projectId: project.id,
		});
		await query(
			`INSERT INTO blueprint_technologies (blueprint_id, technology_id)
			 SELECT $1, id FROM technologies WHERE slug = $2`,
			[page.id, techSlug],
		);
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	const config = () => ({
		zones: [
			{ id: 'web', label: 'E2E Webapp', technologies: [techSlug], layerLabels: { ui: 'Screens' } },
			{ id: 'server', label: 'E2E Server' },
		],
	});

	test('the API stores, validates and resets the config for the creator only', async ({
		request,
	}) => {
		const headers = { Authorization: `Bearer ${owner.token}` };

		const saved = await request.put(`${API_URL}/api/projects/${project.id}`, {
			headers,
			data: { architecture: config() },
		});
		expect(saved.status()).toBe(200);
		const fetched = await request.get(`${API_URL}/api/projects/${project.slug}`);
		expect((await fetched.json()).architecture).toEqual(config());

		const invalid = await request.put(`${API_URL}/api/projects/${project.id}`, {
			headers,
			data: { architecture: { zones: [{ id: 'web', label: 'Web', technologies: [techSlug] }] } },
		});
		expect(invalid.status()).toBe(400);

		const stranger = await createTestUser('Map Stranger', 'user');
		const forbidden = await request.put(`${API_URL}/api/projects/${project.id}`, {
			headers: { Authorization: `Bearer ${stranger.token}` },
			data: { architecture: null },
		});
		expect(forbidden.status()).toBe(403);

		const reset = await request.put(`${API_URL}/api/projects/${project.id}`, {
			headers,
			data: { architecture: null },
		});
		expect(reset.status()).toBe(200);
		expect((await reset.json()).architecture).toBeNull();
	});

	test('the creator configures zones in the editor, then resets to the default map', async ({
		page,
	}) => {
		await authenticate(page, owner);
		await page.goto(`/projects/${project.slug}`);

		// Default: one zone holding every blueprint
		await expect(page.getByText('Application', { exact: true }).first()).toBeVisible();

		await page.getByRole('button', { name: 'Configure' }).click();
		const field = page.getByLabel('Configuration (JSON)');
		await field.fill('{ "zones": [] }');
		await expect(page.getByRole('alert')).toContainText('zones');
		await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();

		await field.fill(JSON.stringify(config()));
		await page.getByRole('button', { name: 'Save' }).click();
		await expect(page.getByText('Project updated')).toBeVisible();

		await expect(page.getByText('E2E Webapp', { exact: true }).first()).toBeVisible();
		await expect(page.getByText('E2E Server', { exact: true }).first()).toBeVisible();
		await page.getByRole('button', { name: 'Screens: 1' }).click();
		await expect(page.getByText(`E2E Map Page ${stamp}`)).toBeVisible();
		await expect(page.getByText(`E2E Map Endpoint ${stamp}`)).toHaveCount(0);

		await page.getByRole('button', { name: 'Configure' }).click();
		await page.getByRole('button', { name: 'Reset to default' }).click();
		await expect(page.getByText('E2E Webapp', { exact: true })).toHaveCount(0);
		await expect(page.getByText('Application', { exact: true }).first()).toBeVisible();
	});

	test('other users see the map without the Configure button', async ({ page }) => {
		const reader = await createTestUser('Map Reader', 'user');
		await authenticate(page, reader);
		await page.goto(`/projects/${project.slug}`);

		await expect(page.getByRole('heading', { name: 'Architecture' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Configure' })).toHaveCount(0);
	});
});
