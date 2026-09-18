/**
 * Pure business logic for blueprints.
 * No I/O — 100% test coverage required.
 */

export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.slice(0, 100);
}

export function normalizeTagName(tag: string): string {
	return tag.toLowerCase().trim();
}

export function appendSlugSuffix(slug: string): string {
	return `${slug}-${Date.now().toString(36)}`;
}

export function shouldCreateNewVersion(
	existingContent: string | null,
	newContent: string | undefined,
): boolean {
	if (newContent === undefined) return false;
	if (existingContent === null) return true;
	return existingContent !== newContent;
}

/**
 * Blueprint slugs are unique within their owning project, never globally: two
 * projects may each hold their own `form-field`.
 */
export class SlugConflictError extends Error {
	readonly status = 409;

	constructor(slug: string, projectLabel: string) {
		super(`Slug "${slug}" already exists in project ${projectLabel}`);
		this.name = 'SlugConflictError';
	}
}

/** Thrown when a write targets a project that does not exist (HTTP 404). */
export class UnknownProjectError extends Error {
	readonly status = 404;

	constructor(project: string) {
		super(`Project "${project}" not found`);
		this.name = 'UnknownProjectError';
	}
}

export interface SlugCandidate {
	id: string;
	/** The owning project's slug (empty while a blueprint has no project yet). */
	projectSlugs: string[];
}

/** Thrown when a slug lookup without a project scope matches several namespaces. */
export class AmbiguousSlugError extends Error {
	readonly status = 409;
	readonly candidates: SlugCandidate[];

	constructor(slug: string, candidates: SlugCandidate[]) {
		const where = candidates
			.map((c) => (c.projectSlugs.length === 0 ? 'global' : c.projectSlugs.join('+')))
			.join(', ');
		super(`Slug "${slug}" exists in several namespaces (${where}): pass project= to disambiguate`);
		this.name = 'AmbiguousSlugError';
		this.candidates = candidates;
	}
}

/**
 * Picks the slug to store. An explicit slug (the sync's pattern-id) is an
 * identity and must not be altered, so a collision is a conflict. A slug
 * generated from the name gets a suffix instead, so publishing from the UI
 * never fails on a name clash.
 */
export function pickSlug(input: {
	requested: string;
	explicit: boolean;
	taken: boolean;
	projectLabel: string;
}): string {
	if (!input.taken) return input.requested;
	if (input.explicit) throw new SlugConflictError(input.requested, input.projectLabel);
	return appendSlugSuffix(input.requested);
}

/** Resolves an unscoped slug lookup: no match, the single match, or ambiguous. */
export function pickSlugCandidate<T extends SlugCandidate>(
	slug: string,
	candidates: T[],
): T | null {
	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0] as T;
	throw new AmbiguousSlugError(slug, candidates);
}
