import { expect, test } from '@playwright/test';
import { authenticate } from './helpers/auth.js';
import {
	cleanupE2eData,
	createTestUser,
	query,
	seedBlueprint,
	type TestUser,
} from './helpers/db.js';

test.describe('Blueprint CRUD', () => {
	let user: TestUser;

	test.beforeEach(async () => {
		user = await createTestUser('CRUD Tester', 'user');
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('create → view → edit → delete', async ({ page }) => {
		test.setTimeout(120000);
		await authenticate(page, user);

		const name = `E2E CRUD Blueprint ${Date.now()}`;
		const description = 'A blueprint created by the E2E CRUD test';
		const editedDescription = 'Edited by the E2E CRUD test';
		const content = '# Steps\n\nDo the thing.';

		// ── Create ──
		await page.goto('/blueprints/new');
		await page.getByLabel('Name', { exact: false }).fill(name);
		await page.getByLabel('Description', { exact: false }).first().fill(description);
		await page.getByLabel('Layer', { exact: false }).click();
		await page.getByRole('option', { name: /^domain/i }).click();
		// Technologies: type a name absent from the catalog and add it
		const technology = `E2E Tech Crud ${Date.now()}`;
		await page.getByLabel('Technologies', { exact: false }).click();
		await page.getByPlaceholder('Search technologies...').fill(technology);
		await page.getByRole('option', { name: `Add “${technology}”` }).click();
		await page.keyboard.press('Escape');
		await page.getByLabel('Content', { exact: false }).fill(content);
		await page.getByRole('button', { name: /^save$/i }).click();

		// Redirects home; the new blueprint appears in the list
		await expect(page.getByText(name).first()).toBeVisible({ timeout: 15000 });

		// ── View ──
		await page.getByText(name).first().click();
		await expect(page.getByRole('heading', { name })).toBeVisible();
		await expect(page.getByText(description)).toBeVisible();
		await expect(page.getByText('Do the thing.')).toBeVisible();
		await expect(page.getByRole('link', { name: technology })).toBeVisible();

		const { rows } = await query<{ id: string }>(`SELECT id FROM blueprints WHERE name = $1`, [
			name,
		]);
		const blueprintId = rows[0].id;

		// ── Edit ──
		await page.getByRole('button', { name: /edit/i }).click();
		await expect(page).toHaveURL(new RegExp(`/blueprints/${blueprintId}/edit`));
		await page.getByLabel('Description', { exact: false }).first().fill(editedDescription);
		await page.getByRole('button', { name: /^save$/i }).click();
		await expect(page).toHaveURL(new RegExp(`/blueprints/${blueprintId}$`));
		await expect(page.getByText(editedDescription)).toBeVisible();

		// ── Delete ──
		await page
			.getByRole('button', { name: /delete/i })
			.first()
			.click();
		await page
			.getByRole('button', { name: /^delete$/i })
			.last()
			.click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByText(name)).toHaveCount(0);

		const remaining = await query(`SELECT id FROM blueprints WHERE name = $1`, [name]);
		expect(remaining.rows).toHaveLength(0);
	});

	test('seeded blueprint is visible on the detail page', async ({ page }) => {
		const bp = await seedBlueprint(user.id, {
			name: `E2E Seeded ${Date.now()}`,
			description: 'Seeded straight into the database',
			content: '# Seeded content',
		});

		await authenticate(page, user);
		await page.goto(`/blueprints/${bp.id}`);
		await expect(page.getByRole('heading', { name: bp.name })).toBeVisible();
		await expect(page.getByText('Seeded straight into the database')).toBeVisible();
	});
});
