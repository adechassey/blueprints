import { zValidator } from '@hono/zod-validator';
import { and, count, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { blueprintProjects, blueprints, projectMembers, projects, users } from '../db/schema.js';
import { auth } from '../lib/auth.js';
import {
	addBlueprintToProjectSchema,
	createProjectSchema,
	updateProjectSchema,
} from '../lib/validation.js';
import { getUser, requireAuth } from '../middleware/auth.js';

export const projectRoutes = new Hono()
	.get('/projects', async (c) => {
		const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
		return c.json(result);
	})
	.get('/projects/:slug', async (c) => {
		const slug = c.req.param('slug');
		const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
		if (!project) {
			return c.json({ error: 'Project not found' }, 404);
		}

		const projectBlueprints = await db
			.select()
			.from(blueprints)
			.innerJoin(blueprintProjects, eq(blueprints.id, blueprintProjects.blueprintId))
			.where(eq(blueprintProjects.projectId, project.id))
			.orderBy(desc(blueprints.createdAt));

		const [memberCountResult] = await db
			.select({ count: count() })
			.from(projectMembers)
			.where(eq(projectMembers.projectId, project.id));

		// Optionally check if the authenticated user is a member
		let isMember = false;
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (session) {
			const [membership] = await db
				.select({ id: projectMembers.id })
				.from(projectMembers)
				.where(
					and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, session.user.id)),
				)
				.limit(1);
			isMember = !!membership;
		}

		return c.json({
			...project,
			blueprints: projectBlueprints.map((row) => row.blueprints),
			memberCount: memberCountResult?.count ?? 0,
			isMember,
		});
	})
	.post('/projects', requireAuth, zValidator('json', createProjectSchema), async (c) => {
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

		if (!project) throw new Error('Insert project failed');

		// Creator is automatically added as owner
		await db.insert(projectMembers).values({
			projectId: project.id,
			userId: user.id,
			role: 'owner',
		});

		return c.json(project, 201);
	})
	.put('/projects/:id', requireAuth, zValidator('json', updateProjectSchema), async (c) => {
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
	})
	.post('/projects/:slug/join', requireAuth, async (c) => {
		const slug = c.req.param('slug');
		const user = getUser(c);

		const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
		if (!project) {
			return c.json({ error: 'Project not found' }, 404);
		}

		// Upsert — idempotent if already a member
		const existing = await db
			.select({ id: projectMembers.id, role: projectMembers.role })
			.from(projectMembers)
			.where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, user.id)))
			.limit(1);

		if (existing.length > 0) {
			return c.json({ message: 'Already a member', role: existing[0]?.role });
		}

		await db.insert(projectMembers).values({
			projectId: project.id,
			userId: user.id,
			role: 'member',
		});

		return c.json({ message: 'Joined project', role: 'member' }, 201);
	})
	.delete('/projects/:slug/leave', requireAuth, async (c) => {
		const slug = c.req.param('slug');
		const user = getUser(c);

		const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
		if (!project) {
			return c.json({ error: 'Project not found' }, 404);
		}

		const [membership] = await db
			.select({ id: projectMembers.id, role: projectMembers.role })
			.from(projectMembers)
			.where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, user.id)))
			.limit(1);

		if (!membership) {
			return c.json({ error: 'Not a member of this project' }, 400);
		}

		if (membership.role === 'owner') {
			return c.json({ error: 'Owners cannot leave a project. Transfer ownership first.' }, 400);
		}

		await db
			.delete(projectMembers)
			.where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, user.id)));

		return c.json({ message: 'Left project' });
	})
	.get('/projects/:slug/members', async (c) => {
		const slug = c.req.param('slug');

		const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
		if (!project) {
			return c.json({ error: 'Project not found' }, 404);
		}

		const members = await db
			.select({
				userId: projectMembers.userId,
				role: projectMembers.role,
				joinedAt: projectMembers.joinedAt,
				name: users.name,
				image: users.image,
			})
			.from(projectMembers)
			.leftJoin(users, eq(projectMembers.userId, users.id))
			.where(eq(projectMembers.projectId, project.id))
			.orderBy(projectMembers.joinedAt);

		return c.json(members);
	})
	.post(
		'/projects/:slug/blueprints',
		requireAuth,
		zValidator('json', addBlueprintToProjectSchema),
		async (c) => {
			const slug = c.req.param('slug');
			const { blueprintId } = c.req.valid('json');
			const user = getUser(c);

			const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
			if (!project) {
				return c.json({ error: 'Project not found' }, 404);
			}

			// Must be a project member (or admin)
			if (user.role !== 'admin') {
				const [membership] = await db
					.select({ id: projectMembers.id })
					.from(projectMembers)
					.where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, user.id)))
					.limit(1);
				if (!membership) {
					return c.json({ error: 'You must be a member of this project' }, 403);
				}
			}

			const [blueprint] = await db
				.select({ id: blueprints.id, authorId: blueprints.authorId })
				.from(blueprints)
				.where(eq(blueprints.id, blueprintId))
				.limit(1);
			if (!blueprint) {
				return c.json({ error: 'Blueprint not found' }, 404);
			}

			// Only the blueprint author or admin can add it to a project
			if (blueprint.authorId !== user.id && user.role !== 'admin') {
				return c.json({ error: 'Only the blueprint author can add it to a project' }, 403);
			}

			// Idempotent — no error if already linked
			const existing = await db
				.select({ blueprintId: blueprintProjects.blueprintId })
				.from(blueprintProjects)
				.where(
					and(
						eq(blueprintProjects.blueprintId, blueprintId),
						eq(blueprintProjects.projectId, project.id),
					),
				)
				.limit(1);

			if (existing.length > 0) {
				return c.json({ message: 'Blueprint already in project' });
			}

			await db.insert(blueprintProjects).values({
				blueprintId,
				projectId: project.id,
				addedBy: user.id,
			});

			return c.json({ message: 'Blueprint added to project' }, 201);
		},
	)
	.delete('/projects/:slug/blueprints/:blueprintId', requireAuth, async (c) => {
		const slug = c.req.param('slug');
		const blueprintId = c.req.param('blueprintId');
		const user = getUser(c);

		const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
		if (!project) {
			return c.json({ error: 'Project not found' }, 404);
		}

		// Must be a project member (or admin)
		if (user.role !== 'admin') {
			const [membership] = await db
				.select({ id: projectMembers.id })
				.from(projectMembers)
				.where(and(eq(projectMembers.projectId, project.id), eq(projectMembers.userId, user.id)))
				.limit(1);
			if (!membership) {
				return c.json({ error: 'You must be a member of this project' }, 403);
			}
		}

		await db
			.delete(blueprintProjects)
			.where(
				and(
					eq(blueprintProjects.blueprintId, blueprintId),
					eq(blueprintProjects.projectId, project.id),
				),
			);

		return c.json({ message: 'Blueprint removed from project' });
	});
