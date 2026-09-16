import { rateLimiter } from 'hono-rate-limiter';

/** General API rate limit: 100 req/min per IP (configurable via RATE_LIMIT_GENERAL) */
export const generalRateLimit = rateLimiter({
	windowMs: 60 * 1000,
	limit: Number(process.env.RATE_LIMIT_GENERAL) || 100,
	keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

/** Strict rate limit for expensive operations: 10 req/min (RATE_LIMIT_STRICT) */
export const strictRateLimit = rateLimiter({
	windowMs: 60 * 1000,
	limit: Number(process.env.RATE_LIMIT_STRICT) || 10,
	keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
});

/** Download endpoint: 5 req/min per IP per blueprint (RATE_LIMIT_DOWNLOAD) */
export const downloadRateLimit = rateLimiter({
	windowMs: 60 * 1000,
	limit: Number(process.env.RATE_LIMIT_DOWNLOAD) || 5,
	keyGenerator: (c) => {
		const ip = c.req.header('x-forwarded-for') || 'unknown';
		const id = c.req.param('id');
		return `${ip}:${id}`;
	},
});
