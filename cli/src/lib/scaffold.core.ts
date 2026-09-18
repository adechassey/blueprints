/**
 * Pure logic for the `scaffold` command: turn a project's blueprints
 * (grouped by architecture layer) into a file map written to disk.
 * No I/O — 100% test coverage required.
 */
import { BLUEPRINT_LAYERS } from '@blueprints/shared';

/** Blueprint entry as returned by GET /projects/:slug/scaffold. */
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

export interface ScaffoldProjectInfo {
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

/**
 * Relative file path of each blueprint inside the scaffold output, in input
 * order: `blueprints/<layer>/<slug>.md`. Slugs are unique within the owning
 * project, so paths never collide.
 */
export function blueprintFilePaths(blueprints: ScaffoldBlueprint[]): string[] {
	return blueprints.map((bp) => `blueprints/${bp.layer}/${bp.slug}.md`);
}

/** Serialized manifest (scaffold.json) describing the scaffold run. */
export function buildManifest(
	project: ScaffoldProjectInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): string {
	const paths = pathsByBlueprint(blueprints);
	return JSON.stringify(
		{
			project: project.slug,
			name: project.name,
			generatedAt: new Date().toISOString(),
			technologies,
			layers: groupByLayer(blueprints).map((g) => ({
				layer: g.layer,
				blueprints: g.blueprints.map((b) => ({
					slug: b.slug,
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
	project: ScaffoldProjectInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): string {
	const paths = pathsByBlueprint(blueprints);
	const lines: string[] = [];
	lines.push(`# ${project.name}`);
	if (project.description) {
		lines.push('');
		lines.push(project.description);
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
 * blueprintFilePaths), plus index.md and scaffold.json at the root. Paths are
 * relative to the output directory.
 */
export function buildScaffoldFiles(
	project: ScaffoldProjectInfo,
	technologies: { name: string; slug: string }[],
	blueprints: ScaffoldBlueprint[],
): Map<string, string> {
	const files = new Map<string, string>();
	for (const [bp, path] of pathsByBlueprint(blueprints)) {
		files.set(path, bp.content);
	}
	files.set('index.md', buildIndex(project, technologies, blueprints));
	files.set('scaffold.json', buildManifest(project, technologies, blueprints));
	return files;
}

function pathsByBlueprint(blueprints: ScaffoldBlueprint[]): Map<ScaffoldBlueprint, string> {
	const paths = blueprintFilePaths(blueprints);
	return new Map(blueprints.map((bp, i) => [bp, paths[i] as string]));
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
