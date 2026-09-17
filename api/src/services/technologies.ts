import { eq, inArray, or, sql } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { blueprintTechnologies, technologies } from '../db/schema.js';
import { dedupeById, type TechnologyRef, toTechnologyRefs } from './technologies.core.js';

/** The technology a reference points to: same slug first, else same name ignoring case. */
async function findTechnology(db: DB, ref: TechnologyRef) {
	const [row] = await db
		.select()
		.from(technologies)
		.where(
			or(
				eq(technologies.slug, ref.slug),
				sql`lower(${technologies.name}) = ${ref.name.toLowerCase()}`,
			),
		)
		.orderBy(sql`${technologies.slug} = ${ref.slug} desc`)
		.limit(1);
	return row;
}

/**
 * Resolves technology references (catalog slugs or display names) to rows,
 * creating unknown ones on the fly. Never returns the same technology twice,
 * so the result can be inserted into a join table as is.
 */
export async function resolveTechnologies(db: DB, inputs: string[]) {
	const rows = [];
	for (const ref of toTechnologyRefs(inputs)) {
		const existing = await findTechnology(db, ref);
		if (existing) {
			rows.push(existing);
			continue;
		}
		const [created] = await db.insert(technologies).values(ref).onConflictDoNothing().returning();
		// A concurrent request may have created it between the lookup and the insert
		const row = created ?? (await findTechnology(db, ref));
		if (!row) throw new Error(`Insert technology "${ref.name}" failed`);
		rows.push(row);
	}
	return dedupeById(rows);
}

/** Technologies attached to blueprints, keyed by blueprint id. */
export async function technologiesOfMany(db: DB, blueprintIds: string[]) {
	if (blueprintIds.length === 0) return new Map<string, { name: string; slug: string }[]>();
	const rows = await db
		.select({
			blueprintId: blueprintTechnologies.blueprintId,
			name: technologies.name,
			slug: technologies.slug,
		})
		.from(blueprintTechnologies)
		.innerJoin(technologies, eq(blueprintTechnologies.technologyId, technologies.id))
		.where(inArray(blueprintTechnologies.blueprintId, blueprintIds));
	const map = new Map<string, { name: string; slug: string }[]>();
	for (const row of rows) {
		const list = map.get(row.blueprintId) ?? [];
		list.push({ name: row.name, slug: row.slug });
		map.set(row.blueprintId, list);
	}
	return map;
}
