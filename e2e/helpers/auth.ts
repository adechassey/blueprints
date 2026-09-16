import crypto from 'node:crypto';
import type { Page } from '@playwright/test';
import { E2E_AUTH_SECRET, SESSION_COOKIE_NAME } from './db.js';

/**
 * Better Auth session cookies are signed: value = `${token}.${base64(hmac-sh256(token, secret))}`.
 * Inserting a session row in the test DB + forging this cookie authenticates
 * the browser without running the Google OAuth flow.
 */
function signSessionToken(token: string, secret = E2E_AUTH_SECRET): string {
	const signature = crypto.createHmac('sha256', secret).update(token).digest('base64');
	return `${token}.${signature}`;
}

/**
 * Authenticates the given page's browser context for subsequent navigations.
 * Call BEFORE page.goto().
 */
export async function authenticate(page: Page, user: { token: string }): Promise<void> {
	await page.context().addCookies([
		{
			name: SESSION_COOKIE_NAME,
			value: signSessionToken(user.token),
			domain: 'localhost',
			path: '/',
			httpOnly: true,
			sameSite: 'None',
			secure: true,
		},
	]);
}
