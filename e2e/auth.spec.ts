import { expect, test } from '@playwright/test';
import { authenticate } from './helpers/auth.js';
import { cleanupE2eData, createTestUser } from './helpers/db.js';

test.describe('Authentication', () => {
	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('unauthenticated visit redirects to login', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/login/);
	});

	test('authenticated user sees the app with their session', async ({ page }) => {
		const user = await createTestUser('Auth Tester', 'user');
		await authenticate(page, user);

		await page.goto('/');
		await expect(page).toHaveURL(/\//);

		// The header should render the app shell, not the login redirect
		await expect(page.getByRole('link', { name: 'Theodo Blueprints' })).toBeVisible();
		await expect(page.getByRole('button', { name: /new blueprint/i })).toBeVisible();
	});

	test('authenticated user is not redirected away from a protected page', async ({ page }) => {
		const user = await createTestUser('Protected Tester', 'admin');
		await authenticate(page, user);

		await page.goto('/blueprints/new');
		await expect(page).not.toHaveURL(/\/login/);
		await expect(page.getByLabel(/name/i)).toBeVisible();
	});
});
