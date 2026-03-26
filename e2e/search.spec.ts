import { expect, test } from '@playwright/test';

test.describe('Search', () => {
	test('app loads and serves HTML', async ({ page }) => {
		const response = await page.goto('/');
		expect(response?.status()).toBe(200);
		expect(response?.headers()['content-type']).toContain('text/html');
	});
});
