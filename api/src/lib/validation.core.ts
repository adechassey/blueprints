/**
 * Validation utility functions.
 * Pure functions — 100% test coverage required.
 */

export function isValidSlug(slug: string): boolean {
	return /^[a-z0-9-]+$/.test(slug) && slug.length >= 1 && slug.length <= 100;
}

export function isValidStack(stack: string): boolean {
	return ['server', 'webapp', 'shared', 'fullstack'].includes(stack);
}

export function paginationDefaults(
	page?: number,
	limit?: number,
): { page: number; limit: number; offset: number } {
	const p = Math.max(1, page ?? 1);
	const l = Math.min(100, Math.max(1, limit ?? 20));
	return { page: p, limit: l, offset: (p - 1) * l };
}
