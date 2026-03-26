import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
	test('redirects unauthenticated users to login', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/login/);
	});

	test('login page shows app branding', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByText('Blueprints').first()).toBeVisible();
	});

	test('login page shows sign in button', async ({ page }) => {
		await page.goto('/login');
		await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
	});
});
