import { count, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { blueprintTags, tags } from '../db/schema.js';

export const tagRoutes = new Hono().get('/tags', async (c) => {
	const result = await db
		.select({
			id: tags.id,
			name: tags.name,
			slug: tags.slug,
			count: count(blueprintTags.blueprintId),
		})
		.from(tags)
		.leftJoin(blueprintTags, eq(tags.id, blueprintTags.tagId))
		.groupBy(tags.id, tags.name, tags.slug)
		.orderBy(tags.name);

	return c.json(result);
});
