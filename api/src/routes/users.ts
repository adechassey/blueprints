import { zValidator } from '@hono/zod-validator';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { blueprints, users } from '../db/schema.js';
import { getUser, requireAuth } from '../middleware/auth.js';

const listBlueprintsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const userRoutes = new Hono()
	.get('/users/me', requireAuth, (c) => {
		const user = getUser(c);
		return c.json(user);
	})
	.get('/users/:id', async (c) => {
		const id = c.req.param('id');
		const [user] = await db
			.select({
				id: users.id,
				name: users.name,
				image: users.image,
				role: users.role,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (!user) return c.json({ error: 'User not found' }, 404);
		return c.json(user);
	})
	.get('/users/:id/blueprints', zValidator('query', listBlueprintsSchema), async (c) => {
		const id = c.req.param('id');
		const { page, limit } = c.req.valid('query');
		const offset = (page - 1) * limit;

		const items = await db
			.select()
			.from(blueprints)
			.where(eq(blueprints.authorId, id))
			.orderBy(desc(blueprints.createdAt))
			.limit(limit)
			.offset(offset);

		return c.json({ items, page, limit });
	});
