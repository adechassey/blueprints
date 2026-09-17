import type { BlueprintLayer } from '@blueprints/shared';
import { toLayer } from '../lib/layers.core.js';
import { LAYER_META } from '../lib/layers.js';
import { cn } from '../lib/utils.js';
import { Badge } from './ui/badge.js';

/** Icon tint per layer, matching the layer badge variants. */
const LAYER_ICON_COLOR: Record<BlueprintLayer, string> = {
	database: 'text-emerald-600 dark:text-emerald-400',
	api: 'text-blue-600 dark:text-blue-400',
	domain: 'text-amber-600 dark:text-amber-400',
	ui: 'text-violet-600 dark:text-violet-400',
	state: 'text-cyan-600 dark:text-cyan-400',
	infra: 'text-orange-600 dark:text-orange-400',
	testing: 'text-teal-600 dark:text-teal-400',
	tooling: 'text-pink-600 dark:text-pink-400',
};

/** A layer's colored badge with its icon and label. */
export function LayerBadge({ layer, className }: { layer: string; className?: string }) {
	const known = toLayer(layer);
	if (!known) return <Badge className={className}>{layer}</Badge>;

	const { icon: Icon, label } = LAYER_META[known];
	return (
		<Badge variant={known} className={className}>
			<Icon className="size-3" />
			{label()}
		</Badge>
	);
}

/** A layer's icon and label, sized for a select option. */
export function LayerOption({ layer }: { layer: BlueprintLayer }) {
	const { icon: Icon, label } = LAYER_META[layer];
	return (
		<>
			<Icon className={cn('size-4', LAYER_ICON_COLOR[layer])} />
			{label()}
		</>
	);
}
