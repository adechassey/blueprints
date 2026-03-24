import type { Context, MiddlewareHandler } from 'hono';
import { auth, type Session } from '../lib/auth.js';

export const requireAuth: MiddlewareHandler = async (c, next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	c.set('user', session.user);
	c.set('session', session.session);
	return next();
};

export function getUser(c: Context): Session['user'] {
	return c.get('user');
}

export function getSession(c: Context): Session['session'] {
	return c.get('session');
}
