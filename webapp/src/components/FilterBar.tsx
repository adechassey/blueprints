import * as m from '../paraglide/messages.js';

interface FilterBarProps {
	stack?: string;
	layer?: string;
	tag?: string;
	onFilterChange: (key: string, value: string | undefined) => void;
}

const STACKS = ['server', 'webapp', 'shared', 'fullstack'];

export function FilterBar({ stack, layer, tag, onFilterChange }: FilterBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<select
				value={stack || ''}
				onChange={(e) => onFilterChange('stack', e.target.value || undefined)}
				className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
			>
				<option value="">{m.filter_all_stacks()}</option>
				{STACKS.map((s) => (
					<option key={s} value={s}>
						{s}
					</option>
				))}
			</select>

			<input
				type="text"
				placeholder={m.filter_layer_placeholder()}
				value={layer || ''}
				onChange={(e) => onFilterChange('layer', e.target.value || undefined)}
				className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
			/>

			<input
				type="text"
				placeholder={m.filter_tag_placeholder()}
				value={tag || ''}
				onChange={(e) => onFilterChange('tag', e.target.value || undefined)}
				className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
			/>
		</div>
	);
}
