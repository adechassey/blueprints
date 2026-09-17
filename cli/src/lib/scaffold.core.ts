/**
 * Pure logic for the `stack scaffold` command: turn the stack's blueprints
 * (grouped by architecture layer) into a file map written to disk.
 * No I/O — 100% test coverage required.
 */
import { BLUEPRINT_LAYERS } from '@blueprints/shared';

/** Blueprint entry as returned by GET /stacks/:id/blueprints. */
export interface ScaffoldBlueprint {
	slug: string;
	name: string;
	layer: string;
	description: string | null;
	technologies: string[];
	/** Slugs of the projects the blueprint belongs to (absent from older API responses). */
	projects?: string[];
	content: string;
}

export interface ScaffoldLayerGroup {
	layer: string;
	blueprints: ScaffoldBlueprint[];
}

export interface ScaffoldStackInfo {
	slug: string;
	name: string;
	description: string | null;
}

/** Canonical order for layers; unknown layers come last, in encounter order. */
function layerIndex(layer: string): number {
	const idx = BLUEPRINT_LAYERS.indexOf(layer as (typeof BLUEPRINT_LAYERS)[number]);
	return idx === -1 ? BLUEPRINT_LAYERS.length : idx;
}

/** Groups blueprints by layer, canonical order first. */
export function groupByLayer(blueprints: ScaffoldBlueprint[]): ScaffoldLayerGroup[] {
	const byLayer = new Map<string, ScaffoldBlueprint[]>();
	for (const bp of blueprints) {
		const group = byLayer.get(bp.layer) ?? [];
		group.push(bp);
		byLayer.set(bp.layer, group);
	}
	return [...byLayer.entries()]
		.sort((a, b) => layerIndex(a[0]) - layerIndex(b[0]))
		.map(([layer, group]) => ({ layer, blueprints: group }));
}

/** Name of the slug namespace for blueprints outside any project. */
const GLOBAL_NAMESPACE = 'global';

/** The namespace a blueprint's file is suffixed with: its first project, alphabetically. */
function namespaceOf(bp: ScaffoldBlueprint): string {
	return [...(bp.projects ?? [])].sort()[0] ?? GLOBAL_NAMESPACE;
}

function collisionKey(bp: ScaffoldBlueprint): string {
	return `${bp.layer}/${bp.slug}`;
}

/** Keys (layer and slug) shared by more than one blueprint. */
function collidingKeys(blueprints: ScaffoldBlueprint[]): Set<string> {
	const seen = new Set<string>();
	const colliding = new Set<string>();
	for (const bp of blueprints) {
		const key = collisionKey(bp);
		if (seen.has(key)) colliding.add(key);
		seen.add(key);
	}
	return colliding;
}

/**
 * Relative file path of each blueprint inside the scaffold output, in input
 * order: `blueprints/<layer>/<slug>.md`. Slugs are only unique per project,
 * so blueprints sharing a layer and a slug are all suffixed with their
 * project (`<slug>.<project>.md`) instead of overwriting each other.
 */
export function blueprintFilePaths(blueprints: ScaffoldBlueprint[]): string[] {
	const colliding = collidingKeys(blueprints);
	return blueprints.map((bp) =>
		colliding.has(collisionKey(bp))
			? `blueprints/${bp.layer}/${bp.slug}.${namespaceOf(bp)}.md`
			: `blueprints/${bp.layer}/${bp.slug}.md`,
	);
}

interface SlugCollision {
	layer: string;
	slug: string;
	/** Namespace (project slug, or "global") of each colliding blueprint. */
	namespaces: string[];
}

/** Blueprints sharing a layer and a slug: the same pattern published by several projects. */
export function findSlugCollisions(blueprints: ScaffoldBlueprint[]): SlugCollision[] {
	const colliding = collidingKeys(blueprints);
	const collisions = new Map<string, SlugCollision>();
	for (const bp of blueprints) {
		const key = collisionKey(bp);
		if (!colliding.has(key)) continue;
		const collision = collisions.get(key) ?? { layer: bp.layer, slug: bp.slug, namespaces: [] };
		collision.namespaces.push(namespaceOf(bp));
		collisions.set(key, collision);
	}
	return [...collisions.values()];
}

/** Serialized manifest (stack.json) describing the scaffold run. */
export function buildManifest(
	stack: ScaffoldStackInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): string {
	const paths = pathsByBlueprint(blueprints);
	return JSON.stringify(
		{
			stack: stack.slug,
			name: stack.name,
			generatedAt: new Date().toISOString(),
			technologies,
			layers: groupByLayer(blueprints).map((g) => ({
				layer: g.layer,
				blueprints: g.blueprints.map((b) => ({
					slug: b.slug,
					projects: b.projects ?? [],
					file: paths.get(b),
				})),
			})),
		},
		null,
		2,
	);
}

/** Markdown index of the scaffold, grouped by layer, linking each blueprint file. */
export function buildIndex(
	stack: ScaffoldStackInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): string {
	const paths = pathsByBlueprint(blueprints);
	const lines: string[] = [];
	lines.push(`# ${stack.name}`);
	if (stack.description) {
		lines.push('');
		lines.push(stack.description);
	}
	lines.push('');
	lines.push(`**Technologies:** ${technologies.map((t) => t.name).join(', ')}`);
	lines.push('');
	for (const group of groupByLayer(blueprints)) {
		lines.push(`## ${capitalize(group.layer)}`);
		lines.push('');
		for (const bp of group.blueprints) {
			const desc = bp.description ? ` — ${bp.description}` : '';
			lines.push(`- [${bp.name}](./${paths.get(bp)})${desc}`);
		}
		lines.push('');
	}
	return lines.join('\n');
}

/**
 * Full file map of the scaffold: blueprints under blueprints/<layer>/ (see
 * blueprintFilePaths),
 * plus index.md and stack.json at the root. Paths are relative to the output
 * directory.
 */
export function buildScaffoldFiles(
	stack: ScaffoldStackInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): Map<string, string> {
	const files = new Map<string, string>();
	for (const [bp, path] of pathsByBlueprint(blueprints)) {
		files.set(path, bp.content);
	}
	files.set('index.md', buildIndex(stack, technologies, blueprints));
	files.set('stack.json', buildManifest(stack, technologies, blueprints));
	return files;
}

function pathsByBlueprint(blueprints: ScaffoldBlueprint[]): Map<ScaffoldBlueprint, string> {
	const paths = blueprintFilePaths(blueprints);
	return new Map(blueprints.map((bp, i) => [bp, paths[i] as string]));
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
