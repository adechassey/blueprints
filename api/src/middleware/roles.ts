import type { MiddlewareHandler } from 'hono';
import { getUser } from './auth.js';

export function requireRole(...roles: string[]): MiddlewareHandler {
	return async (c, next) => {
		const user = getUser(c);
		if (!roles.includes(user.role ?? 'user')) {
			return c.json({ error: 'Forbidden' }, 403);
		}
		return next();
	};
}
