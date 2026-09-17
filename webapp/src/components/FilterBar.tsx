import { BLUEPRINT_LAYERS } from '@blueprints/shared';
import { X } from 'lucide-react';
import { useTags } from '../hooks/useTags.js';
import * as m from '../paraglide/messages.js';
import { Combobox } from './Combobox.js';
import { LayerOption } from './LayerBadge.js';
import { TechnologyPicker } from './TechnologyPicker.js';
import { Button } from './ui/button.js';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from './ui/select.js';

/** Radix Select items cannot carry an empty value: sentinel for "no layer filter". */
const ALL_LAYERS = 'all';

interface FilterBarProps {
	technos: string[];
	layer?: string;
	tag?: string;
	onFilterChange: (key: 'techno' | 'layer' | 'tag', value: string | undefined) => void;
	onClear: () => void;
	total?: number;
}

export function FilterBar({ technos, layer, tag, onFilterChange, onClear, total }: FilterBarProps) {
	const { data: tags = [] } = useTags();
	const hasFilters = technos.length > 0 || !!layer || !!tag;

	return (
		<section className="flex flex-wrap items-center gap-3">
			<Select
				value={layer ?? ALL_LAYERS}
				onValueChange={(v) => onFilterChange('layer', v === ALL_LAYERS ? undefined : v)}
			>
				<SelectTrigger className="w-full sm:w-44" aria-label={m.filter_layer_placeholder()}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_LAYERS}>{m.filter_all_layers()}</SelectItem>
					<SelectSeparator />
					{BLUEPRINT_LAYERS.map((l) => (
						<SelectItem key={l} value={l}>
							<LayerOption layer={l} />
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<TechnologyPicker
				value={technos}
				onValueChange={(v) => onFilterChange('techno', v.length ? v.join(',') : undefined)}
				placeholder={m.filter_all_technologies()}
				aria-label={m.filter_techno_placeholder()}
				className="w-full sm:w-64"
			/>

			<Combobox
				options={tags.map((t) => ({ value: t.name, label: t.name, count: t.count }))}
				value={tag ? [tag] : []}
				onValueChange={([v]) => onFilterChange('tag', v)}
				placeholder={m.filter_all_tags()}
				searchPlaceholder={m.picker_search_tags()}
				aria-label={m.filter_tag_placeholder()}
				className="w-full sm:w-44"
			/>

			{hasFilters && (
				<Button variant="ghost" size="sm" onClick={onClear}>
					<X className="h-4 w-4" />
					{m.filter_clear()}
				</Button>
			)}

			{total != null && (
				<div className="ml-auto text-sm text-on-surface-variant">
					{total === 1
						? m.blueprint_count_one({ count: total })
						: m.blueprint_count_other({ count: total })}
				</div>
			)}
		</section>
	);
}
