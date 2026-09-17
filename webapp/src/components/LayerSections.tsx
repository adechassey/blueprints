import { groupByLayer } from '../lib/layers.core.js';
import { LAYER_META } from '../lib/layers.js';
import { CompactBlueprintList } from './BlueprintList.js';
import { LayerOption } from './LayerBadge.js';

type Blueprints = React.ComponentProps<typeof CompactBlueprintList>['blueprints'];

/** Blueprints grouped by layer in canonical order, one titled section per non-empty layer. */
export function LayerSections({ blueprints }: { blueprints: Blueprints }) {
	return groupByLayer(blueprints).map((group) => (
		<section key={group.layer} className="space-y-3">
			<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-outline-variant/50 pb-2">
				<h3 className="flex items-center gap-2 font-headline text-lg font-bold">
					<LayerOption layer={group.layer} />
					<span className="text-sm font-medium text-outline">{group.items.length}</span>
				</h3>
				<p className="text-sm text-on-surface-variant">{LAYER_META[group.layer].description()}</p>
			</div>
			<CompactBlueprintList blueprints={group.items} />
		</section>
	));
}
