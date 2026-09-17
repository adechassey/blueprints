/**
 * Pure stack logic.
 * No I/O — 100% test coverage required.
 */
import { BLUEPRINT_LAYERS } from '@blueprints/shared';

/** One blueprint as returned to the scaffold command. */
export interface StackBlueprint {
	slug: string;
	name: string;
	layer: string;
	description: string | null;
	technologies: string[];
	content: string;
}

interface LayerGroup<T> {
	layer: string;
	blueprints: T[];
}

/**
 * Groups blueprints by architecture layer in canonical order
 * (database, api, domain, ui, state, infra, testing, tooling), unknown
 * layers last. Blueprints keep their input order within a layer.
 */
export function groupBlueprintsByLayer<T extends { layer: string }>(
	blueprints: T[],
): LayerGroup<T>[] {
	const byLayer = new Map<string, T[]>();
	for (const bp of blueprints) {
		const group = byLayer.get(bp.layer) ?? [];
		group.push(bp);
		byLayer.set(bp.layer, group);
	}

	const layerIndex = (l: string) => {
		const idx = BLUEPRINT_LAYERS.indexOf(l as (typeof BLUEPRINT_LAYERS)[number]);
		return idx === -1 ? BLUEPRINT_LAYERS.length : idx;
	};

	return [...byLayer.entries()]
		.sort((a, b) => layerIndex(a[0]) - layerIndex(b[0]))
		.map(([layer, group]) => ({ layer, blueprints: group }));
}

/** Relative file path of a blueprint inside a scaffold output directory. */
export function scaffoldFilePath(blueprint: { layer: string; slug: string }): string {
	return `blueprints/${blueprint.layer}/${blueprint.slug}.md`;
}

/** Serialized manifest describing a scaffold run (machine-readable summary). */
export function buildScaffoldManifest(input: {
	stackSlug: string;
	stackName: string;
	technologies: { name: string; slug: string }[];
	blueprints: StackBlueprint[];
}): string {
	const layers = groupBlueprintsByLayer(input.blueprints).map((g) => ({
		layer: g.layer,
		blueprints: g.blueprints.map((b) => b.slug),
	}));
	return JSON.stringify(
		{
			stack: input.stackSlug,
			name: input.stackName,
			generatedAt: new Date().toISOString(),
			technologies: input.technologies,
			layers,
		},
		null,
		2,
	);
}

/** Markdown index of the scaffolded stack, grouped by layer. */
export function buildScaffoldIndex(
	stackName: string,
	stackDescription: string | null,
	technologies: { name: string; slug: string }[],
	blueprints: StackBlueprint[],
): string {
	const lines: string[] = [];
	lines.push(`# ${stackName}`);
	if (stackDescription) {
		lines.push('');
		lines.push(stackDescription);
	}
	lines.push('');
	lines.push(`**Technologies:** ${technologies.map((t) => t.name).join(', ')}`);
	lines.push('');
	for (const group of groupBlueprintsByLayer(blueprints)) {
		lines.push(`## ${capitalize(group.layer)}`);
		lines.push('');
		for (const bp of group.blueprints) {
			const desc = bp.description ? ` — ${bp.description}` : '';
			lines.push(`- [${bp.name}](./${scaffoldFilePath(bp)})${desc}`);
		}
		lines.push('');
	}
	return lines.join('\n');
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
