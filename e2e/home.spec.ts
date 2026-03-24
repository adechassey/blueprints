import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
	test('loads and shows the app title', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('text=Blueprints')).toBeVisible();
	});

	test('shows navigation links', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('nav >> text=All')).toBeVisible();
		await expect(page.locator('nav >> text=Projects')).toBeVisible();
		await expect(page.locator('nav >> text=Tags')).toBeVisible();
	});

	test('shows search bar', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
	});
});
