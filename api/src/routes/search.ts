import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { strictRateLimit } from '../middleware/rate-limit.js';
import { semanticSearch } from '../services/search.js';

const searchSchema = z.object({
	q: z.string().min(1),
	stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
	layer: z.string().optional(),
	tag: z.string().optional(),
	projectId: z.string().uuid().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const searchRoutes = new Hono().get(
	'/blueprints/search',
	strictRateLimit,
	zValidator('query', searchSchema),
	async (c) => {
		const { q, ...filters } = c.req.valid('query');
		const result = await semanticSearch(db, q, filters);
		return c.json(result);
	},
);
