/**
 * Pure technology-reference helpers.
 * 100% test coverage required.
 */
interface CatalogEntry {
	name: string;
	slug: string;
}

/** Splits a comma-separated list (URL param, form input) into trimmed, non-empty items. */
export function parseList(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

/**
 * The catalog entry a reference points to — same slug, else same name
 * ignoring case — mirroring how the API resolves references.
 */
function findTechnology<T extends CatalogEntry>(catalog: T[], ref: string): T | undefined {
	const lower = ref.trim().toLowerCase();
	return (
		catalog.find((t) => t.slug === lower) ?? catalog.find((t) => t.name.toLowerCase() === lower)
	);
}

/**
 * Canonicalizes references to catalog slugs so "React", "react" and a
 * pre-selected slug all mark the same option. Unknown references (a
 * technology typed in to be created) are kept trimmed. Duplicates are dropped.
 */
export function normalizeReferences(refs: string[], catalog: CatalogEntry[]): string[] {
	const canonical = refs
		.map((ref) => findTechnology(catalog, ref)?.slug ?? ref.trim())
		.filter(Boolean);
	return [...new Set(canonical)];
}

/** Display name of a reference: the catalog name when known, else the reference itself. */
export function technologyName(ref: string, catalog: CatalogEntry[]): string {
	return findTechnology(catalog, ref)?.name ?? ref;
}
