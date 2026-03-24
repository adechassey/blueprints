import { expect, test } from '@playwright/test';

test.describe('Search', () => {
	test('search bar accepts input and has submit button', async ({ page }) => {
		await page.goto('/');
		const searchInput = page.locator('input[placeholder*="Search"]');
		await searchInput.fill('NestJS controller');
		await expect(searchInput).toHaveValue('NestJS controller');
		await expect(page.locator('button:has-text("Search")')).toBeVisible();
	});

	// TODO: Full search E2E test requires a running API with seeded data
	// test('submitting search shows results', async ({ page }) => {
	//   await page.goto('/');
	//   await page.fill('input[placeholder*="Search"]', 'controller');
	//   await page.click('button:has-text("Search")');
	//   await expect(page.locator('text=Search results')).toBeVisible();
	// });
});
