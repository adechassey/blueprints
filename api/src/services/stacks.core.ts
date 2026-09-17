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
