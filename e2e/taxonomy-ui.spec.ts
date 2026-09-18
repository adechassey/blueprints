import { expect, test } from '@playwright/test';
import { authenticate } from './helpers/auth.js';
import {
	cleanupE2eData,
	createTestUser,
	query,
	seedBlueprint,
	type TestUser,
} from './helpers/db.js';

/**
 * Webapp views of the taxonomy: filtering the listing by technology and layer.
 */
test.describe('Technologies and layers (UI)', () => {
	let user: TestUser;
	let stamp: number;
	let technology: { name: string; slug: string };

	test.beforeEach(async () => {
		user = await createTestUser('Taxonomy Browser', 'user');
		stamp = Date.now();
		technology = { name: `E2E Tech UI ${stamp}`, slug: `e2e-tech-ui-${stamp}` };
		await query('INSERT INTO technologies (name, slug, category) VALUES ($1, $2, $3)', [
			technology.name,
			technology.slug,
			'framework',
		]);

		const api = await seedBlueprint(user.id, {
			name: `E2E Layered Route ${stamp}`,
			description: 'API layer fixture',
			content: '# Route',
			layer: 'api',
		});
		const ui = await seedBlueprint(user.id, {
			name: `E2E Layered Table ${stamp}`,
			description: 'UI layer fixture',
			content: '# Table',
			layer: 'ui',
		});
		await seedBlueprint(user.id, {
			name: `E2E Untagged ${stamp}`,
			description: 'Carries no technology',
			content: '# Untagged',
			layer: 'api',
		});
		await query(
			`INSERT INTO blueprint_technologies (blueprint_id, technology_id)
			 SELECT b.id, t.id FROM blueprints b, technologies t WHERE b.id = ANY($1) AND t.slug = $2`,
			[[api.id, ui.id], technology.slug],
		);
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('filters the listing by technology, then by layer', async ({ page }) => {
		await authenticate(page, user);
		await page.goto('/');

		await page.getByRole('combobox', { name: 'Filter by technology' }).click();
		await page.getByPlaceholder('Search technologies...').fill(technology.name);
		await page.getByRole('option', { name: technology.name }).click();
		await page.keyboard.press('Escape');

		await expect(page).toHaveURL(new RegExp(`techno=${technology.slug}`));
		await expect(page.getByText(`E2E Layered Route ${stamp}`)).toBeVisible();
		await expect(page.getByText(`E2E Layered Table ${stamp}`)).toBeVisible();
		await expect(page.getByText(`E2E Untagged ${stamp}`)).toHaveCount(0);

		await page.getByRole('combobox', { name: 'Filter by layer' }).click();
		await page.getByRole('option', { name: 'UI' }).click();

		await expect(page).toHaveURL(/layer=ui/);
		await expect(page.getByText(`E2E Layered Table ${stamp}`)).toBeVisible();
		await expect(page.getByText(`E2E Layered Route ${stamp}`)).toHaveCount(0);
	});
});
