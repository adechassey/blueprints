import { expect, test } from '@playwright/test';
import { authenticate } from './helpers/auth.js';
import { cleanupE2eData, createTestUser, seedBlueprint, type TestUser } from './helpers/db.js';

test.describe('Comments', () => {
	let user: TestUser;
	let blueprintId: string;

	test.beforeEach(async () => {
		user = await createTestUser('Comments Tester', 'user');
		const bp = await seedBlueprint(user.id, {
			name: `E2E Comment Target ${Date.now()}`,
			description: 'A blueprint used by the comments test.',
			content: '# Comments target',
		});
		blueprintId = bp.id;
	});

	test.afterEach(async () => {
		await cleanupE2eData();
	});

	test('add → reply → delete', async ({ page }) => {
		await authenticate(page, user);
		await page.goto(`/blueprints/${blueprintId}`);

		const commentText = 'E2E comment: looks great!';
		const replyText = 'E2E reply: thanks for the feedback!';

		// ── Add a top-level comment ──
		await page.getByPlaceholder(/write a comment/i).fill(commentText);
		await page.getByRole('button', { name: /^post$/i }).click();
		await expect(page.getByText(commentText)).toBeVisible({ timeout: 15000 });

		// ── Reply to it ──
		await page.getByRole('button', { name: 'Reply' }).click();
		await page.getByPlaceholder(/write a reply/i).fill(replyText);
		await page.getByRole('button', { name: 'Post' }).last().click();
		await expect(page.getByText(replyText)).toBeVisible({ timeout: 15000 });

		// ── Delete the reply (last Delete button in the thread) ──
		await page.getByRole('button', { name: 'Delete' }).last().click();
		await expect(page.getByText(replyText)).toHaveCount(0, { timeout: 15000 });

		// The parent comment is still there
		await expect(page.getByText(commentText)).toBeVisible();
	});
});
