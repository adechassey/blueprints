import { zValidator } from '@hono/zod-validator';
import { count, desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { blueprints, comments, projects, users } from '../db/schema.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const changeRoleSchema = z.object({
	role: z.enum(['admin', 'maintainer', 'user']),
});

export const adminRoutes = new Hono()
	.use('/admin/*', requireAuth, requireRole('admin'))
	.get('/admin/stats', async (c) => {
		const [userCount] = await db.select({ count: count() }).from(users);
		const [blueprintCount] = await db.select({ count: count() }).from(blueprints);
		const [commentCount] = await db.select({ count: count() }).from(comments);
		const [projectCount] = await db.select({ count: count() }).from(projects);

		return c.json({
			users: userCount.count,
			blueprints: blueprintCount.count,
			comments: commentCount.count,
			projects: projectCount.count,
		});
	})
	.get('/admin/users', async (c) => {
		const result = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				image: users.image,
				role: users.role,
				createdAt: users.createdAt,
				blueprintCount: sql<number>`(SELECT count(*) FROM blueprints WHERE blueprints.author_id = ${users.id})`,
			})
			.from(users)
			.orderBy(users.name);

		return c.json(result);
	})
	.put('/admin/users/:id/role', zValidator('json', changeRoleSchema), async (c) => {
		const targetId = c.req.param('id');
		const { role } = c.req.valid('json');
		const currentUser = getUser(c);

		if (targetId === currentUser.id) {
			return c.json({ error: 'Cannot change your own role' }, 400);
		}

		const [updated] = await db
			.update(users)
			.set({ role })
			.where(eq(users.id, targetId))
			.returning({ id: users.id, name: users.name, role: users.role });

		if (!updated) {
			return c.json({ error: 'User not found' }, 404);
		}

		return c.json(updated);
	})
	.get('/admin/comments', async (c) => {
		const result = await db
			.select({
				id: comments.id,
				content: comments.content,
				authorId: comments.authorId,
				authorName: users.name,
				blueprintId: comments.blueprintId,
				createdAt: comments.createdAt,
			})
			.from(comments)
			.leftJoin(users, eq(comments.authorId, users.id))
			.orderBy(desc(comments.createdAt))
			.limit(100);

		return c.json(result);
	})
	.delete('/admin/comments/:id', async (c) => {
		const id = c.req.param('id');
		const [existing] = await db
			.select({ id: comments.id })
			.from(comments)
			.where(eq(comments.id, id))
			.limit(1);
		if (!existing) return c.json({ error: 'Comment not found' }, 404);
		await db.delete(comments).where(eq(comments.parentId, id));
		await db.delete(comments).where(eq(comments.id, id));
		return c.json({ success: true });
	})
	.delete('/admin/projects/:id', async (c) => {
		const id = c.req.param('id');
		const [existing] = await db
			.select({ id: projects.id })
			.from(projects)
			.where(eq(projects.id, id))
			.limit(1);
		if (!existing) return c.json({ error: 'Project not found' }, 404);
		// Unlink blueprints from project first
		await db.update(blueprints).set({ projectId: null }).where(eq(blueprints.projectId, id));
		await db.delete(projects).where(eq(projects.id, id));
		return c.json({ success: true });
	});
