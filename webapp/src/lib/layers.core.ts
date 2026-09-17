/**
 * Pure architecture-layer helpers.
 * 100% test coverage required.
 */
import { BLUEPRINT_LAYERS, type BlueprintLayer } from '@blueprints/shared';

/**
 * Narrows an untrusted value (URL search param, imported frontmatter) to a
 * known layer. Legacy free-text layers ("service", "controller"…) are not
 * layers anymore: the API would reject them.
 */
export function toLayer(value: unknown): BlueprintLayer | undefined {
	return BLUEPRINT_LAYERS.find((layer) => layer === value);
}

interface LayerGroup<T> {
	layer: BlueprintLayer;
	items: T[];
}

/**
 * Groups items by layer in canonical order (database → tooling), skipping
 * empty layers. Items keep their input order within a layer; items with an
 * unknown layer are dropped.
 */
export function groupByLayer<T extends { layer: string }>(items: T[]): LayerGroup<T>[] {
	return BLUEPRINT_LAYERS.map((layer) => ({
		layer,
		items: items.filter((item) => item.layer === layer),
	})).filter((group) => group.items.length > 0);
}
