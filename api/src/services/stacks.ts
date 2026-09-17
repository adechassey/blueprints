import { eq, inArray } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import {
	blueprints,
	blueprintTechnologies,
	blueprintVersions,
	stacks,
	stackTechnologies,
	technologies,
} from '../db/schema.js';
import type { CreateStackInput, UpdateStackInput } from '../lib/validation.js';
import { generateSlug } from './blueprints.core.js';
import { groupBlueprintsByLayer, type StackBlueprint } from './stacks.core.js';

/** Thrown when a stack slug is already taken (HTTP 409). */
export class StackSlugConflictError extends Error {
	readonly status = 409;

	constructor(slug: string) {
		super(`Stack slug "${slug}" already exists`);
		this.name = 'StackSlugConflictError';
	}
}

async function upsertStackTechnologies(db: DB, names: string[]) {
	const result = [];
	for (const name of names) {
		const slug = generateSlug(name);
		const [existing] = await db
			.select()
			.from(technologies)
			.where(eq(technologies.slug, slug))
			.limit(1);
		if (existing) {
			result.push(existing);
		} else {
			const [created] = await db.insert(technologies).values({ name, slug }).returning();
			if (!created) throw new Error('Insert technology failed');
			result.push(created);
		}
	}
	return result;
}

async function technologiesOfStack(db: DB, stackId: string) {
	return db
		.select({ id: technologies.id, name: technologies.name, slug: technologies.slug })
		.from(stackTechnologies)
		.innerJoin(technologies, eq(stackTechnologies.technologyId, technologies.id))
		.where(eq(stackTechnologies.stackId, stackId));
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findStack(db: DB, id: string) {
	const condition = UUID_RE.test(id) ? eq(stacks.id, id) : eq(stacks.slug, id);
	const [stack] = await db.select().from(stacks).where(condition).limit(1);
	return stack ?? null;
}

export async function listStacks(db: DB) {
	const rows = await db.select().from(stacks).orderBy(stacks.name);
	const result = [];
	for (const stack of rows) {
		const techs = await technologiesOfStack(db, stack.id);
		result.push({ ...stack, technologies: techs });
	}
	return result;
}

export async function getStack(db: DB, id: string) {
	const stack = await findStack(db, id);
	if (!stack) return null;
	const techs = await technologiesOfStack(db, stack.id);
	return { ...stack, technologies: techs };
}

export async function createStack(db: DB, input: CreateStackInput, userId: string) {
	const slug = input.slug ?? generateSlug(input.name);
	const [existing] = await db.select().from(stacks).where(eq(stacks.slug, slug)).limit(1);
	if (existing) throw new StackSlugConflictError(slug);

	const [stack] = await db
		.insert(stacks)
		.values({
			name: input.name,
			slug,
			description: input.description,
			createdBy: userId,
		})
		.returning();
	if (!stack) throw new Error('Insert stack failed');

	const techs = await upsertStackTechnologies(db, input.technologies);
	await db.insert(stackTechnologies).values(
		techs.map((t) => ({
			stackId: stack.id,
			technologyId: t.id,
		})),
	);

	return { ...stack, technologies: techs.map((t) => ({ name: t.name, slug: t.slug, id: t.id })) };
}

export async function updateStack(db: DB, id: string, input: UpdateStackInput) {
	const existing = await findStack(db, id);
	if (!existing) return null;

	const metadataUpdate: Record<string, unknown> = {};
	if (input.name !== undefined) metadataUpdate.name = input.name;
	if (input.description !== undefined) metadataUpdate.description = input.description;
	if (Object.keys(metadataUpdate).length > 0) {
		await db.update(stacks).set(metadataUpdate).where(eq(stacks.id, existing.id));
	}

	if (input.technologies !== undefined) {
		await db.delete(stackTechnologies).where(eq(stackTechnologies.stackId, existing.id));
		const techs = await upsertStackTechnologies(db, input.technologies);
		await db.insert(stackTechnologies).values(
			techs.map((t) => ({
				stackId: existing.id,
				technologyId: t.id,
			})),
		);
	}

	return getStack(db, existing.id);
}

export async function deleteStack(db: DB, id: string) {
	const existing = await findStack(db, id);
	if (!existing) return false;
	await db.delete(stacks).where(eq(stacks.id, existing.id));
	return true;
}

/**
 * All blueprints carrying at least one technology of the stack, with their
 * current version content — the feed for the scaffold command.
 */
export async function getStackBlueprints(db: DB, stackId: string): Promise<StackBlueprint[]> {
	const rows = await db
		.select({
			id: blueprints.id,
			slug: blueprints.slug,
			name: blueprints.name,
			layer: blueprints.layer,
			description: blueprints.description,
			content: blueprintVersions.content,
		})
		.from(blueprints)
		.innerJoin(blueprintVersions, eq(blueprints.currentVersionId, blueprintVersions.id))
		.where(
			inArray(
				blueprints.id,
				db
					.select({ id: blueprintTechnologies.blueprintId })
					.from(blueprintTechnologies)
					.innerJoin(
						stackTechnologies,
						eq(blueprintTechnologies.technologyId, stackTechnologies.technologyId),
					)
					.where(eq(stackTechnologies.stackId, stackId)),
			),
		);

	const techRows = rows.length
		? await db
				.select({
					blueprintId: blueprintTechnologies.blueprintId,
					slug: technologies.slug,
				})
				.from(blueprintTechnologies)
				.innerJoin(technologies, eq(blueprintTechnologies.technologyId, technologies.id))
				.where(
					inArray(
						blueprintTechnologies.blueprintId,
						rows.map((r) => r.id),
					),
				)
		: [];
	const techsByBlueprint = new Map<string, string[]>();
	for (const row of techRows) {
		const list = techsByBlueprint.get(row.blueprintId) ?? [];
		list.push(row.slug);
		techsByBlueprint.set(row.blueprintId, list);
	}

	return rows
		.map((r) => ({
			slug: r.slug,
			name: r.name,
			layer: r.layer,
			description: r.description,
			technologies: techsByBlueprint.get(r.id) ?? [],
			content: r.content,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** Blueprints grouped by layer (canonical order) — response shape for the API. */
export async function getStackBlueprintsByLayer(db: DB, stackId: string) {
	return groupBlueprintsByLayer(await getStackBlueprints(db, stackId));
}
