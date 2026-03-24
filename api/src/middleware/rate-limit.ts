import { rateLimiter } from 'hono-rate-limiter';

/** General API rate limit: 100 req/min per IP */
export const generalRateLimit = rateLimiter({
	windowMs: 60 * 1000,
	limit: 100,
	keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

/** Strict rate limit for expensive operations: 10 req/min */
export const strictRateLimit = rateLimiter({
	windowMs: 60 * 1000,
	limit: 10,
	keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

/** Download endpoint: 5 req/min per IP per blueprint */
export const downloadRateLimit = rateLimiter({
	windowMs: 60 * 1000,
	limit: 5,
	keyGenerator: (c) => {
		const ip = c.req.header('x-forwarded-for') || 'unknown';
		const id = c.req.param('id');
		return `${ip}:${id}`;
	},
});
