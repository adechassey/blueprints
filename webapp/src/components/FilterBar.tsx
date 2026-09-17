import { BLUEPRINT_LAYERS } from '@blueprints/shared';
import { ChevronDown } from 'lucide-react';
import { useTags, useTechnologies } from '../hooks/useTags.js';
import * as m from '../paraglide/messages.js';
import { Select } from './ui/select.js';

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
			<div className="relative">
				<Select
					value={layer || ''}
					onChange={(e) => onFilterChange('layer', e.target.value || undefined)}
					className="appearance-none pr-9 font-medium bg-surface-container-lowest"
					aria-label={m.filter_all_layers()}
				>
					<option value="">{m.filter_all_layers()}</option>
					{BLUEPRINT_LAYERS.map((l) => (
						<option key={l} value={l}>
							{l}
						</option>
					))}
				</Select>
				<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
			</div>

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
