import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
	test('unauthenticated visit to / redirects to login', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/login/);
	});

	test('login page renders successfully', async ({ page }) => {
		const response = await page.goto('/login');
		expect(response?.status()).toBe(200);
	});

	test('direct access to /login shows sign in UI', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByText('Blueprints').first()).toBeVisible();
		await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
	});
});
