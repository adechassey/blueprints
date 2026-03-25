import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { isProjectPreviewUrl } from '../lib/vercel-preview.js';

export const previewAuthRoutes = new Hono();

/**
 * Transfer session from production to a preview deployment.
 * Called after OAuth completes on production — the session cookie is already set.
 *
 * GET /auth-transfer?returnTo=https://preview-url.vercel.app
 */
previewAuthRoutes.get('/auth-transfer', (c) => {
	const returnTo = c.req.query('returnTo');

	if (!returnTo || !isProjectPreviewUrl(returnTo)) {
		return c.redirect('/');
	}

	// Better Auth uses __Secure- prefix on HTTPS (production)
	const sessionToken =
		getCookie(c, '__Secure-better-auth.session_token') ?? getCookie(c, 'better-auth.session_token');

	if (!sessionToken) {
		return c.redirect('/login');
	}

	const targetUrl = new URL('/api/auth-receive', returnTo);
	targetUrl.searchParams.set('token', sessionToken);

	return c.redirect(targetUrl.toString());
});

/**
 * Receive session token on a preview deployment and set it as a cookie.
 *
 * GET /auth-receive?token=<session-token>
 */
previewAuthRoutes.get('/auth-receive', (c) => {
	const token = c.req.query('token');

	if (!token) {
		return c.redirect('/login');
	}

	const isSecure = c.req.url.startsWith('https');
	const cookieName = isSecure ? '__Secure-better-auth.session_token' : 'better-auth.session_token';

	setCookie(c, cookieName, token, {
		httpOnly: true,
		secure: isSecure,
		sameSite: 'Lax',
		path: '/',
		maxAge: 30 * 24 * 60 * 60,
	});

	return c.redirect('/');
});
