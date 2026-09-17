import { zValidator } from '@hono/zod-validator';
import { and, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { blueprints as blueprintsTable, projectMembers, projects } from '../db/schema.js';
import {
	blueprintLayerSchema,
	createBlueprintSchema,
	listBlueprintsSchema,
	technoFilterSchema,
	updateBlueprintSchema,
} from '../lib/validation.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import { downloadRateLimit, strictRateLimit } from '../middleware/rate-limit.js';
import {
	createBlueprint,
	deleteBlueprintById,
	getBlueprintById,
	getVersion,
	listBlueprints,
	listVersions,
	updateBlueprint,
} from '../services/blueprints.js';
import { semanticSearch } from '../services/search.js';

const searchSchema = z.object({
	q: z.string().min(1),
	techno: technoFilterSchema,
	layer: blueprintLayerSchema.optional(),
	tag: z.string().optional(),
	projectId: z.string().uuid().optional(),
	project: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Slugs are unique per project, so a slug in `:id` is resolved within
 * `?project=` (slug or UUID). Without it, an ambiguous slug answers 409.
 */
const scopeSchema = z.object({ project: z.string().optional() });

export const blueprintRoutes = new Hono()
	.get('/blueprints/search', strictRateLimit, zValidator('query', searchSchema), async (c) => {
		const { q, techno, ...filters } = c.req.valid('query');
		const result = await semanticSearch(db, q, { ...filters, technologies: techno });
		return c.json(result);
	})
	.get('/blueprints', zValidator('query', listBlueprintsSchema), async (c) => {
		const filters = c.req.valid('query');
		const result = await listBlueprints(db, filters);
		return c.json(result);
	})
	.get('/blueprints/:id', zValidator('query', scopeSchema), async (c) => {
		const id = c.req.param('id');
		const { project } = c.req.valid('query');
		const blueprint = await getBlueprintById(db, id, project);
		if (!blueprint) {
			return c.json({ error: 'Blueprint not found' }, 404);
		}
		return c.json(blueprint);
	})
	.post('/blueprints', requireAuth, zValidator('json', createBlueprintSchema), async (c) => {
		const input = c.req.valid('json');
		const user = getUser(c);

		if (input.projectId && user.role !== 'admin') {
			// Resolve projectId (may be UUID or slug — we accept UUID here)
			const [project] = await db
				.select({ id: projects.id })
				.from(projects)
				.where(eq(projects.id, input.projectId))
				.limit(1);
			if (!project) {
				return c.json({ error: 'Project not found' }, 404);
			}
			const [membership] = await db
				.select({ id: projectMembers.id })
				.from(projectMembers)
				.where(
					and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, user.id)),
				)
				.limit(1);
			if (!membership) {
				return c.json({ error: 'You must be a member of this project to add blueprints' }, 403);
			}
		}

		const blueprint = await createBlueprint(db, input, user.id);
		return c.json(blueprint, 201);
	})
	.put(
		'/blueprints/:id',
		requireAuth,
		zValidator('query', scopeSchema),
		zValidator('json', updateBlueprintSchema),
		async (c) => {
			const id = c.req.param('id');
			const { project } = c.req.valid('query');
			const input = c.req.valid('json');
			const user = getUser(c);

			const existing = await getBlueprintById(db, id, project);
			if (!existing) {
				return c.json({ error: 'Blueprint not found' }, 404);
			}
			if (existing.authorId !== user.id && user.role !== 'admin') {
				return c.json({ error: 'Forbidden' }, 403);
			}

			const updated = await updateBlueprint(db, existing.id, input, user.id);
			return c.json(updated);
		},
	)
	.delete('/blueprints/:id', requireAuth, zValidator('query', scopeSchema), async (c) => {
		const id = c.req.param('id');
		const { project } = c.req.valid('query');
		const user = getUser(c);

		const existing = await getBlueprintById(db, id, project);
		if (!existing) {
			return c.json({ error: 'Blueprint not found' }, 404);
		}
		if (existing.authorId !== user.id && user.role !== 'admin') {
			return c.json({ error: 'Forbidden' }, 403);
		}

		await deleteBlueprintById(db, existing.id);
		return c.json({ success: true });
	})
	.get('/blueprints/:id/versions', async (c) => {
		const id = c.req.param('id');
		const versions = await listVersions(db, id);
		return c.json(versions);
	})
	.get('/blueprints/:id/versions/:version', async (c) => {
		const id = c.req.param('id');
		const version = Number(c.req.param('version'));
		if (Number.isNaN(version)) {
			return c.json({ error: 'Invalid version number' }, 400);
		}
		const ver = await getVersion(db, id, version);
		if (!ver) {
			return c.json({ error: 'Version not found' }, 404);
		}
		return c.json(ver);
	})
	.post('/blueprints/:id/download', downloadRateLimit, async (c) => {
		const id = c.req.param('id');
		const [updated] = await db
			.update(blueprintsTable)
			.set({ downloadCount: sql`${blueprintsTable.downloadCount} + 1` })
			.where(eq(blueprintsTable.id, id))
			.returning({ downloadCount: blueprintsTable.downloadCount });

		if (!updated) return c.json({ error: 'Blueprint not found' }, 404);
		return c.json({ downloadCount: updated.downloadCount });
	});
