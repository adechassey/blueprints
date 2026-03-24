import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import {
	createBlueprintSchema,
	listBlueprintsSchema,
	updateBlueprintSchema,
} from '../lib/validation.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import {
	createBlueprint,
	deleteBlueprintById,
	getBlueprintById,
	getVersion,
	listBlueprints,
	listVersions,
	updateBlueprint,
} from '../services/blueprints.js';

export const blueprintRoutes = new Hono();

// List blueprints (public)
blueprintRoutes.get('/blueprints', zValidator('query', listBlueprintsSchema), async (c) => {
	const filters = c.req.valid('query');
	const result = await listBlueprints(db, filters);
	return c.json(result);
});

// Get blueprint by ID (public)
blueprintRoutes.get('/blueprints/:id', async (c) => {
	const id = c.req.param('id');
	const blueprint = await getBlueprintById(db, id);
	if (!blueprint) {
		return c.json({ error: 'Blueprint not found' }, 404);
	}
	return c.json(blueprint);
});

// Create blueprint (authenticated)
blueprintRoutes.post(
	'/blueprints',
	requireAuth,
	zValidator('json', createBlueprintSchema),
	async (c) => {
		const input = c.req.valid('json');
		const user = getUser(c);
		const blueprint = await createBlueprint(db, input, user.id);
		return c.json(blueprint, 201);
	},
);

// Update blueprint (authenticated, author only)
blueprintRoutes.put(
	'/blueprints/:id',
	requireAuth,
	zValidator('json', updateBlueprintSchema),
	async (c) => {
		const id = c.req.param('id');
		const input = c.req.valid('json');
		const user = getUser(c);

		const existing = await getBlueprintById(db, id);
		if (!existing) {
			return c.json({ error: 'Blueprint not found' }, 404);
		}
		if (existing.authorId !== user.id && user.role !== 'admin') {
			return c.json({ error: 'Forbidden' }, 403);
		}

		const updated = await updateBlueprint(db, id, input, user.id);
		return c.json(updated);
	},
);

// Delete blueprint (authenticated, author or admin)
blueprintRoutes.delete('/blueprints/:id', requireAuth, async (c) => {
	const id = c.req.param('id');
	const user = getUser(c);

	const existing = await getBlueprintById(db, id);
	if (!existing) {
		return c.json({ error: 'Blueprint not found' }, 404);
	}
	if (existing.authorId !== user.id && user.role !== 'admin') {
		return c.json({ error: 'Forbidden' }, 403);
	}

	await deleteBlueprintById(db, id);
	return c.json({ success: true });
});

// List versions (public)
blueprintRoutes.get('/blueprints/:id/versions', async (c) => {
	const id = c.req.param('id');
	const versions = await listVersions(db, id);
	return c.json(versions);
});

// Get specific version (public)
blueprintRoutes.get('/blueprints/:id/versions/:version', async (c) => {
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
});
