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
