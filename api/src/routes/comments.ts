import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import {
	createComment,
	deleteComment,
	getCommentById,
	listComments,
	updateComment,
} from '../services/comments.js';

export const commentRoutes = new Hono();

const createCommentSchema = z.object({
	content: z.string().min(1),
	parentId: z.string().uuid().optional(),
});

const updateCommentSchema = z.object({
	content: z.string().min(1),
});

// List comments for a blueprint (public)
commentRoutes.get('/blueprints/:id/comments', async (c) => {
	const id = c.req.param('id');
	const result = await listComments(db, id);
	return c.json(result);
});

// Create comment (authenticated)
commentRoutes.post(
	'/blueprints/:id/comments',
	requireAuth,
	zValidator('json', createCommentSchema),
	async (c) => {
		const blueprintId = c.req.param('id');
		const { content, parentId } = c.req.valid('json');
		const user = getUser(c);
		const comment = await createComment(db, blueprintId, user.id, content, parentId);
		return c.json(comment, 201);
	},
);

// Update comment (authenticated, author only)
commentRoutes.put(
	'/comments/:id',
	requireAuth,
	zValidator('json', updateCommentSchema),
	async (c) => {
		const id = c.req.param('id');
		const { content } = c.req.valid('json');
		const user = getUser(c);

		const existing = await getCommentById(db, id);
		if (!existing) return c.json({ error: 'Comment not found' }, 404);
		if (existing.authorId !== user.id) return c.json({ error: 'Forbidden' }, 403);

		const updated = await updateComment(db, id, content);
		return c.json(updated);
	},
);

// Delete comment (authenticated, author or admin)
commentRoutes.delete('/comments/:id', requireAuth, async (c) => {
	const id = c.req.param('id');
	const user = getUser(c);

	const existing = await getCommentById(db, id);
	if (!existing) return c.json({ error: 'Comment not found' }, 404);
	if (existing.authorId !== user.id && user.role !== 'admin') {
		return c.json({ error: 'Forbidden' }, 403);
	}

	await deleteComment(db, id);
	return c.json({ success: true });
});
