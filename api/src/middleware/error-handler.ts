import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export const errorHandler: ErrorHandler = (err, c) => {
	const status = ('status' in err ? err.status : 500) as ContentfulStatusCode;
	return c.json({ error: err.message || 'Internal Server Error' }, status);
};
