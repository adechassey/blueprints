import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { logger } from '../lib/logger.js';

export const errorHandler: ErrorHandler = (err, c) => {
	const status = ('status' in err ? err.status : 500) as ContentfulStatusCode;
	logger.error(
		{ err, method: c.req.method, path: c.req.path, status, cause: err.cause ?? '' },
		err.message,
	);
	return c.json({ error: err.message || 'Internal Server Error' }, status);
};
