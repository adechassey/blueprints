import { zValidator } from '@hono/zod-validator';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { blueprints, projects } from '../db/schema.js';
import { createProjectSchema, updateProjectSchema } from '../lib/validation.js';
import { getUser, requireAuth } from '../middleware/auth.js';

export const projectRoutes = new Hono();

// List all projects
projectRoutes.get('/projects', async (c) => {
	const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
	return c.json(result);
});

// Get project by slug with its blueprints
projectRoutes.get('/projects/:slug', async (c) => {
	const slug = c.req.param('slug');
	const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
	if (!project) {
		return c.json({ error: 'Project not found' }, 404);
	}

	const projectBlueprints = await db
		.select()
		.from(blueprints)
		.where(eq(blueprints.projectId, project.id))
		.orderBy(desc(blueprints.createdAt));

	return c.json({ ...project, blueprints: projectBlueprints });
});

// Create project (authenticated)
projectRoutes.post('/projects', requireAuth, zValidator('json', createProjectSchema), async (c) => {
	const input = c.req.valid('json');
	const user = getUser(c);

	const [project] = await db
		.insert(projects)
		.values({
			name: input.name,
			slug: input.slug,
			description: input.description,
			createdBy: user.id,
		})
		.returning();

	return c.json(project, 201);
});

// Update project (authenticated, creator or admin)
projectRoutes.put(
	'/projects/:id',
	requireAuth,
	zValidator('json', updateProjectSchema),
	async (c) => {
		const id = c.req.param('id');
		const input = c.req.valid('json');
		const user = getUser(c);

		const [existing] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
		if (!existing) {
			return c.json({ error: 'Project not found' }, 404);
		}
		if (existing.createdBy !== user.id && user.role !== 'admin') {
			return c.json({ error: 'Forbidden' }, 403);
		}

		const [updated] = await db.update(projects).set(input).where(eq(projects.id, id)).returning();

		return c.json(updated);
	},
);
