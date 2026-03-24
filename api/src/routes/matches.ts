import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import {
	computeAllMatches,
	computeMatchesForBlueprint,
	getMatchesForBlueprint,
	updateMatchStatus,
} from '../services/matches.js';

const updateMatchSchema = z.object({
	status: z.enum(['confirmed', 'dismissed']),
});

export const matchRoutes = new Hono()
	.get('/blueprints/:id/matches', async (c) => {
		const id = c.req.param('id');
		const matches = await getMatchesForBlueprint(db, id);
		return c.json(matches);
	})
	.post('/blueprints/:id/matches/compute', requireAuth, async (c) => {
		const id = c.req.param('id');
		const result = await computeMatchesForBlueprint(db, id);
		return c.json(result);
	})
	.put('/matches/:matchId', requireAuth, zValidator('json', updateMatchSchema), async (c) => {
		const matchId = c.req.param('matchId');
		const { status } = c.req.valid('json');
		const user = getUser(c);
		const updated = await updateMatchStatus(db, matchId, status, user.id);
		if (!updated) return c.json({ error: 'Match not found' }, 404);
		return c.json(updated);
	})
	.post('/admin/matches/compute', requireAuth, requireRole('admin'), async (c) => {
		const result = await computeAllMatches(db);
		return c.json(result);
	});
