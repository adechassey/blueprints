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

/** Relative path of a blueprint file inside the scaffold output. */
export function blueprintFilePath(bp: { layer: string; slug: string }): string {
	return `blueprints/${bp.layer}/${bp.slug}.md`;
}

/** Serialized manifest (stack.json) describing the scaffold run. */
export function buildManifest(
	stack: ScaffoldStackInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): string {
	return JSON.stringify(
		{
			stack: stack.slug,
			name: stack.name,
			generatedAt: new Date().toISOString(),
			technologies,
			layers: groupByLayer(blueprints).map((g) => ({
				layer: g.layer,
				blueprints: g.blueprints.map((b) => b.slug),
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
			lines.push(`- [${bp.name}](./${blueprintFilePath(bp)})${desc}`);
		}
		lines.push('');
	}
	return lines.join('\n');
}

/**
 * Full file map of the scaffold: blueprints under blueprints/<layer>/<slug>.md,
 * plus index.md and stack.json at the root. Paths are relative to the output
 * directory.
 */
export function buildScaffoldFiles(
	stack: ScaffoldStackInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): Map<string, string> {
	const files = new Map<string, string>();
	for (const bp of blueprints) {
		files.set(blueprintFilePath(bp), bp.content);
	}
	files.set('index.md', buildIndex(stack, technologies, blueprints));
	files.set('stack.json', buildManifest(stack, technologies, blueprints));
	return files;
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
