import { count, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { blueprintTechnologies, technologies } from '../db/schema.js';

export const technologyRoutes = new Hono().get('/technologies', async (c) => {
	const result = await db
		.select({
			id: technologies.id,
			name: technologies.name,
			slug: technologies.slug,
			category: technologies.category,
			count: count(blueprintTechnologies.blueprintId),
		})
		.from(technologies)
		.leftJoin(blueprintTechnologies, eq(technologies.id, blueprintTechnologies.technologyId))
		.groupBy(technologies.id, technologies.name, technologies.slug, technologies.category)
		.orderBy(technologies.name);

	return c.json(result);
});
