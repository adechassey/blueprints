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
