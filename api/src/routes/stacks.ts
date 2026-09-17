import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { createStackSchema, updateStackSchema } from '../lib/validation.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import {
	createStack,
	deleteStack,
	getStack,
	getStackBlueprintsByLayer,
	listStacks,
	updateStack,
} from '../services/stacks.js';

/** Stacks are looked up by slug (or UUID) in `:id`. */
const idParam = z.object({ id: z.string() });

export const stackRoutes = new Hono()
	.get('/stacks', async (c) => {
		return c.json(await listStacks(db));
	})
	.get('/stacks/:id', zValidator('param', idParam), async (c) => {
		const stack = await getStack(db, c.req.valid('param').id);
		if (!stack) return c.json({ error: 'Stack not found' }, 404);
		return c.json(stack);
	})
	.get('/stacks/:id/blueprints', zValidator('param', idParam), async (c) => {
		const stack = await getStack(db, c.req.valid('param').id);
		if (!stack) return c.json({ error: 'Stack not found' }, 404);
		const layers = await getStackBlueprintsByLayer(db, stack.id);
		return c.json({
			stack: { slug: stack.slug, name: stack.name, description: stack.description },
			technologies: stack.technologies,
			layers,
		});
	})
	.post('/stacks', requireAuth, zValidator('json', createStackSchema), async (c) => {
		const user = getUser(c);
		const input = c.req.valid('json');
		const stack = await createStack(db, input, user.id);
		return c.json(stack, 201);
	})
	.put(
		'/stacks/:id',
		requireAuth,
		zValidator('param', idParam),
		zValidator('json', updateStackSchema),
		async (c) => {
			const user = getUser(c);
			const stack = await getStack(db, c.req.valid('param').id);
			if (!stack) return c.json({ error: 'Stack not found' }, 404);
			if (stack.createdBy !== user.id && user.role !== 'admin') {
				return c.json({ error: 'Forbidden' }, 403);
			}
			const updated = await updateStack(db, stack.id, c.req.valid('json'));
			return c.json(updated);
		},
	)
	.delete('/stacks/:id', requireAuth, zValidator('param', idParam), async (c) => {
		const user = getUser(c);
		const stack = await getStack(db, c.req.valid('param').id);
		if (!stack) return c.json({ error: 'Stack not found' }, 404);
		if (stack.createdBy !== user.id && user.role !== 'admin') {
			return c.json({ error: 'Forbidden' }, 403);
		}
		await deleteStack(db, stack.id);
		return c.json({ success: true });
	});
