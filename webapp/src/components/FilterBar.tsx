import { BLUEPRINT_LAYERS } from '@blueprints/shared';
import { useTags, useTechnologies } from '../hooks/useTags.js';
import * as m from '../paraglide/messages.js';
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
	techno?: string;
	layer?: string;
	tag?: string;
	onFilterChange: (key: string, value: string | undefined) => void;
	total?: number;
	showing?: number;
}

export function FilterBar({ techno, layer, tag, onFilterChange, total, showing }: FilterBarProps) {
	const { data: tags } = useTags();
	const { data: technologies } = useTechnologies();

	return (
		<section className="flex flex-wrap items-center gap-3">
			<Select
				value={layer ?? ALL_LAYERS}
				onValueChange={(v) => onFilterChange('layer', v === ALL_LAYERS ? undefined : v)}
			>
				<SelectTrigger className="w-44" aria-label={m.filter_layer_placeholder()}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_LAYERS}>{m.filter_all_layers()}</SelectItem>
					<SelectSeparator />
					{BLUEPRINT_LAYERS.map((l) => (
						<SelectItem key={l} value={l}>
							{l}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<input
				type="text"
				list="filter-technos-datalist"
				placeholder={m.filter_techno_placeholder()}
				value={techno || ''}
				onChange={(e) => onFilterChange('techno', e.target.value || undefined)}
				className="w-44 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm font-medium text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
				aria-label={m.filter_techno_placeholder()}
			/>
			<datalist id="filter-technos-datalist">
				{(technologies ?? []).map((t) => (
					<option key={t.id} value={t.slug} />
				))}
			</datalist>

			<input
				type="text"
				list="filter-tags-datalist"
				placeholder={m.filter_tag_placeholder()}
				value={tag || ''}
				onChange={(e) => onFilterChange('tag', e.target.value || undefined)}
				className="w-40 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm font-medium text-on-surface placeholder:text-outline outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
				aria-label={m.filter_tag_placeholder()}
			/>
			<datalist id="filter-tags-datalist">
				{(tags?.length ? tags : []).map((t) => (
					<option key={t.id} value={t.name} />
				))}
			</datalist>

			{total != null && (
				<div className="ml-auto text-sm text-on-surface-variant">
					{showing != null
						? m.filter_showing_of({ showing, count: total })
						: total === 1
							? m.blueprint_count_one({ count: total })
							: m.blueprint_count_other({ count: total })}
				</div>
			)}
		</section>
	);
}
