import { expect, test } from '@playwright/test';
import { authenticate } from './helpers/auth.js';
import { cleanupE2eData, createTestUser, seedBlueprint, type TestUser } from './helpers/db.js';

test.describe('Search', () => {
	let user: TestUser;

	test.beforeEach(async () => {
		user = await createTestUser('Search Tester', 'user');
		// Unique keyword only present in the fixture, so the search is meaningful
		await seedBlueprint(user.id, {
			name: 'E2E Zorblax Pagination Hook',
			description: 'UseZorblax is a unique token for pagination.',
			content: '# Zorblax usage',
		});
		await seedBlueprint(user.id, {
			name: 'E2E Unrelated Blueprint',
			description: 'Completely different topic here.',
			content: '# Unrelated',
		});
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('typing a query shows matching results', async ({ page }) => {
		await authenticate(page, user);
		await page.goto('/');

		const searchBox = page.getByPlaceholder(/search/i);
		await searchBox.fill('UseZorblax');

		// URL updates with the query (instant search, debounced)
		await expect(page).toHaveURL(/q=UseZorblax/, { timeout: 15000 });
		await expect(page.getByText('E2E Zorblax Pagination Hook')).toBeVisible({ timeout: 15000 });
	});

	test('clearing the search restores the full listing', async ({ page }) => {
		await authenticate(page, user);
		await page.goto('/');

		const searchBox = page.getByPlaceholder(/search/i);
		await searchBox.fill('UseZorblax');
		await expect(page).toHaveURL(/q=UseZorblax/, { timeout: 15000 });

		await page.getByRole('button', { name: /clear/i }).click();
		await expect(page).not.toHaveURL(/q=/, { timeout: 15000 });
		await expect(page.getByText('E2E Unrelated Blueprint')).toBeVisible();
	});

	test('no-match queries show an empty state', async ({ page }) => {
		await authenticate(page, user);
		await page.goto('/');

		await page.getByPlaceholder(/search/i).fill('qqqzzznothingmatchesthis');
		await expect(page.getByText(/no blueprints found/i)).toBeVisible({ timeout: 15000 });
	});
});
