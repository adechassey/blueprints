import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export const errorHandler: ErrorHandler = (err, c) => {
	const status = ('status' in err ? err.status : 500) as ContentfulStatusCode;
	console.error(`[${c.req.method}] ${c.req.path} → ${status}:`, err.message, err.stack);
	return c.json({ error: err.message || 'Internal Server Error' }, status);
};
