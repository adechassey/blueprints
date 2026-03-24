import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
	test('navigates to projects page', async ({ page }) => {
		await page.goto('/');
		await page.click('nav >> text=Projects');
		await expect(page).toHaveURL(/\/projects/);
	});

	test('navigates to tags page', async ({ page }) => {
		await page.goto('/');
		await page.click('nav >> text=Tags');
		await expect(page).toHaveURL(/\/tags/);
	});

	test('navigates to login page', async ({ page }) => {
		await page.goto('/login');
		await expect(page.locator('text=Sign in')).toBeVisible();
	});

	// TODO: Auth-dependent navigation tests
	// test('navigates to new blueprint page (requires auth)', ...)
	// test('navigates to admin page (requires admin role)', ...)
});
