import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils.js';
import * as m from '../paraglide/messages.js';
import { Badge } from './ui/badge.js';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from './ui/command.js';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover.js';

interface ComboboxOption {
	value: string;
	label: string;
	/** Key of the group the option is listed under (see `groups`). */
	group?: string;
	/** Usage count shown next to the label. */
	count?: number;
}

interface ComboboxProps {
	options: ComboboxOption[];
	/** Group order and headings; options without a listed group go last, ungrouped. */
	groups?: { key: string; label: string }[];
	/** Selected values: option values, or free values created by the user. */
	value: string[];
	onValueChange: (value: string[]) => void;
	multiple?: boolean;
	/** Offer to add the typed text as a new value when nothing matches it exactly. */
	creatable?: boolean;
	/** Label of a selected value that is not an option (a created value). */
	labelOf?: (value: string) => string;
	placeholder: string;
	searchPlaceholder: string;
	id?: string;
	className?: string;
	'aria-label'?: string;
}

/**
 * shadcn combobox pattern (Popover + Command): a searchable select, single or
 * multiple, grouped, optionally accepting values that are not in the list.
 */
export function Combobox({
	options,
	groups = [],
	value,
	onValueChange,
	multiple = false,
	creatable = false,
	labelOf = (v) => v,
	placeholder,
	searchPlaceholder,
	id,
	className,
	'aria-label': ariaLabel,
}: ComboboxProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');

	const selected = new Set(value);
	// Selected values outside the options (created by the user), listed so they can be unticked
	const created = value.filter((v) => !options.some((o) => o.value === v));
	const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? labelOf(v);

	const toggle = (v: string) => {
		if (multiple) {
			onValueChange(selected.has(v) ? value.filter((x) => x !== v) : [...value, v]);
		} else {
			onValueChange(selected.has(v) ? [] : [v]);
			setOpen(false);
		}
		setSearch('');
	};

	const typed = search.trim();
	const typedLower = typed.toLowerCase();
	const canCreate =
		creatable &&
		typed !== '' &&
		!options.some((o) => o.label.toLowerCase() === typedLower || o.value === typedLower) &&
		!value.some((v) => v.toLowerCase() === typedLower);

	const knownGroups = new Set(groups.map((g) => g.key));
	const sections = [
		...groups.map((g) => ({ ...g, options: options.filter((o) => o.group === g.key) })),
		{ key: '', label: '', options: options.filter((o) => !o.group || !knownGroups.has(o.group)) },
	].filter((section) => section.options.length > 0);

	const shown = value.slice(0, 2);
	const hidden = value.length - shown.length;

	return (
		// Modal: its own scroll lock, otherwise an enclosing Dialog's lock swallows wheel events on the list
		<Popover open={open} onOpenChange={setOpen} modal>
			<PopoverTrigger asChild>
				<button
					id={id}
					type="button"
					role="combobox"
					aria-expanded={open}
					aria-label={ariaLabel}
					className={cn(
						'flex min-h-[42px] w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-left text-sm font-medium text-on-surface outline-none transition-all cursor-pointer hover:border-outline focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
						className,
					)}
				>
					<span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
						{value.length === 0 ? (
							<span className="truncate font-normal text-outline">{placeholder}</span>
						) : multiple ? (
							<>
								{shown.map((v) => (
									<Badge key={v} variant="secondary" className="max-w-full">
										<span className="truncate">{labelFor(v)}</span>
									</Badge>
								))}
								{hidden > 0 && <Badge variant="default">+{hidden}</Badge>}
							</>
						) : (
							<span className="truncate">{labelFor(value[0] ?? '')}</span>
						)}
					</span>
					<ChevronsUpDown className="size-4 shrink-0 text-on-surface-variant" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0">
				<Command loop className="rounded-lg border-0 shadow-none">
					<CommandInput
						placeholder={searchPlaceholder}
						value={search}
						onValueChange={setSearch}
						className="h-10 py-2.5"
					/>
					<CommandList className="max-h-72">
						<CommandEmpty className="py-6">{m.picker_empty()}</CommandEmpty>
						{created.length > 0 && (
							<CommandGroup>
								{created.map((v) => (
									<CommandItem
										key={v}
										value={`created:${v}`}
										keywords={[v]}
										onSelect={() => toggle(v)}
									>
										<Check className="size-4 text-primary" />
										<span className="truncate">{v}</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}
						{sections.map((section) => (
							<CommandGroup key={section.key} heading={section.label || undefined}>
								{section.options.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										keywords={[option.label]}
										onSelect={() => toggle(option.value)}
										className="py-2"
									>
										<Check
											className={cn(
												'size-4 text-primary',
												selected.has(option.value) ? 'opacity-100' : 'opacity-0',
											)}
										/>
										<span className="truncate">{option.label}</span>
										{option.count !== undefined && (
											<span className="ml-auto text-xs tabular-nums text-outline">
												{option.count}
											</span>
										)}
									</CommandItem>
								))}
							</CommandGroup>
						))}
						{/* Last, so Enter picks the best existing match rather than creating a near-duplicate */}
						{canCreate && (
							<CommandGroup forceMount>
								<CommandItem forceMount value={`create:${typed}`} onSelect={() => toggle(typed)}>
									<Plus className="size-4 text-primary" />
									{m.picker_create({ name: typed })}
								</CommandItem>
							</CommandGroup>
						)}
					</CommandList>
					{value.length > 0 && (
						<>
							<CommandSeparator className="mx-0 my-0" />
							<button
								type="button"
								onClick={() => onValueChange([])}
								className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
							>
								<X className="size-3.5" />
								{m.picker_clear()}
							</button>
						</>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	);
}
