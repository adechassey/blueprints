/**
 * Pure technology taxonomy logic.
 * No I/O — 100% test coverage required.
 */
import { generateSlug } from './blueprints.core.js';

/** A technology as referenced by a client: a display name and its derived slug. */
export interface TechnologyRef {
	name: string;
	slug: string;
}

/**
 * Turns client-supplied technology references — catalog slugs (`react`) or
 * display names (`Node.js`) — into lookup keys. Entries that slugify to
 * nothing are dropped; entries sharing a slug keep the first occurrence.
 */
export function toTechnologyRefs(inputs: string[]): TechnologyRef[] {
	const bySlug = new Map<string, TechnologyRef>();
	for (const input of inputs) {
		const name = input.trim();
		const slug = generateSlug(name);
		if (slug && !bySlug.has(slug)) bySlug.set(slug, { name, slug });
	}
	return [...bySlug.values()];
}

/**
 * Keeps the first row per id. Two references can resolve to the same
 * technology (`node` by slug, `Node.js` by name): linking it twice would
 * violate the join table's primary key.
 */
export function dedupeById<T extends { id: string }>(rows: T[]): T[] {
	const byId = new Map<string, T>();
	for (const row of rows) {
		if (!byId.has(row.id)) byId.set(row.id, row);
	}
	return [...byId.values()];
}
