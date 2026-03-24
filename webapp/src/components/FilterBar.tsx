import { ChevronDown } from 'lucide-react';
import * as m from '../paraglide/messages.js';

interface FilterBarProps {
	stack?: string;
	layer?: string;
	tag?: string;
	onFilterChange: (key: string, value: string | undefined) => void;
	total?: number;
	showing?: number;
}

const STACKS = ['server', 'webapp', 'shared', 'fullstack'];

export function FilterBar({ stack, layer, tag, onFilterChange, total, showing }: FilterBarProps) {
	return (
		<section className="flex flex-wrap items-center gap-6 py-6 border-y border-outline-variant/10">
			<div className="flex items-center gap-2">
				<span className="text-xs font-bold uppercase tracking-widest text-outline">Filter by</span>
			</div>
			<div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
				<div className="relative">
					<select
						value={stack || ''}
						onChange={(e) => onFilterChange('stack', e.target.value || undefined)}
						className="appearance-none flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-colors pr-8 border-none outline-none cursor-pointer text-on-surface"
					>
						<option value="">{m.filter_all_stacks()}</option>
						{STACKS.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					<ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
				</div>

				<div className="relative">
					<input
						type="text"
						placeholder={m.filter_layer_placeholder()}
						value={layer || ''}
						onChange={(e) => onFilterChange('layer', e.target.value || undefined)}
						className="px-4 py-2 bg-surface-container-high rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-colors border-none outline-none w-36 text-on-surface placeholder:text-outline"
					/>
				</div>

				<div className="relative">
					<input
						type="text"
						placeholder={m.filter_tag_placeholder()}
						value={tag || ''}
						onChange={(e) => onFilterChange('tag', e.target.value || undefined)}
						className="px-4 py-2 bg-surface-container-high rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-colors border-none outline-none w-36 text-on-surface placeholder:text-outline"
					/>
				</div>
			</div>
			{total != null && (
				<div className="ml-auto text-sm text-outline font-medium">
					{showing != null ? `Showing ${showing} of ${total} blueprints` : `${total} blueprints`}
				</div>
			)}
		</section>
	);
}
