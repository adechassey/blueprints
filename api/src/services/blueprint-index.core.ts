/**
 * Pure blueprint index generation.
 * No I/O — 100% test coverage required.
 */
import { BLUEPRINT_LAYERS } from '@blueprints/shared';

export interface IndexBlueprint {
	slug: string;
	name: string;
	technologies: string[];
	layer: string;
	description: string | null;
	usage: string | null;
}

/**
 * Groups blueprints by architecture layer (canonical order, unknown layers
 * last) and renders a markdown index table.
 */
export function generateBlueprintIndex(projectName: string, blueprints: IndexBlueprint[]): string {
	const lines: string[] = [];
	lines.push(`# Blueprint Index — ${projectName}`);
	lines.push('');

	if (blueprints.length === 0) {
		lines.push('No blueprints in this project.');
		return lines.join('\n');
	}

	const byLayer = new Map<string, IndexBlueprint[]>();
	for (const bp of blueprints) {
		const group = byLayer.get(bp.layer) ?? [];
		group.push(bp);
		byLayer.set(bp.layer, group);
	}

	// Sort layers in canonical order, unknown layers last
	const layerIndex = (l: string) => {
		const idx = BLUEPRINT_LAYERS.indexOf(l as (typeof BLUEPRINT_LAYERS)[number]);
		return idx === -1 ? BLUEPRINT_LAYERS.length : idx;
	};
	const orderedLayers = [...byLayer.keys()].sort((a, b) => layerIndex(a) - layerIndex(b));

	for (const layer of orderedLayers) {
		// biome-ignore lint/style/noNonNullAssertion: iterating keys guarantees existence
		const group = byLayer.get(layer)!;

		// Sort by name
		group.sort((a, b) => a.name.localeCompare(b.name));

		lines.push(`## ${capitalize(layer)}`);
		lines.push('');
		lines.push('| Slug | Technologies | Name | Usage | Description |');
		lines.push('|------|--------------|------|-------|-------------|');

		for (const bp of group) {
			const techs = escapeCell(bp.technologies.join(', '));
			const usage = escapeCell(bp.usage ?? '');
			const desc = escapeCell(bp.description ?? '');
			lines.push(`| ${bp.slug} | ${techs} | ${bp.name} | ${usage} | ${desc} |`);
		}

		lines.push('');
	}

	return lines.join('\n');
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeCell(s: string): string {
	return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
