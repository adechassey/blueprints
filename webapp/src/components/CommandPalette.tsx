import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Blocks, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBlueprints } from '../hooks/useBlueprints.js';
import { toLayer } from '../lib/layers.core.js';
import { LAYER_META } from '../lib/layers.js';
import * as m from '../paraglide/messages.js';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from './ui/command.js';
import { Dialog } from './ui/dialog.js';

function layerLabel(layer: string) {
	const known = toLayer(layer);
	return known ? LAYER_META[known].label() : layer;
}

export function CommandPalette() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const { data } = useBlueprints({ limit: 50 });
	const blueprints = data?.items ?? [];

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isTyping =
				target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setOpen((prev) => !prev);
			} else if (e.key === '/' && !isTyping) {
				e.preventDefault();
				setOpen(true);
			}
		};

		const handleOpenSearch = () => setOpen(true);

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('blueprints:open-search', handleOpenSearch);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('blueprints:open-search', handleOpenSearch);
		};
	}, []);

	const go = (to: string, params?: Record<string, string>) => {
		setOpen(false);
		navigate({ to, params });
	};

	const goSearch = (q: string) => {
		setOpen(false);
		navigate({ to: '/', search: { q } });
	};

	return (
		<Dialog open={open} onClose={() => setOpen(false)} className="max-w-xl space-y-0 p-0">
			<Command className="w-full max-w-xl" loop>
				<CommandInput placeholder={m.search_placeholder()} autoFocus />
				<CommandList>
					<CommandEmpty>{m.search_no_results_generic()}</CommandEmpty>
					<CommandGroup heading="Actions">
						<CommandItem onSelect={() => go('/blueprints/new')}>
							<Plus className="h-4 w-4 text-primary" />
							{m.nav_new_blueprint()}
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Blueprints">
						{blueprints.map((b) => (
							<CommandItem
								key={b.id}
								value={`${b.name} ${b.layer} ${layerLabel(b.layer)} ${(b.technologies ?? []).map((t: { name: string }) => t.name).join(' ')} ${b.description ?? ''}`}
								onSelect={() => go('/blueprints/$blueprintId', { blueprintId: b.id })}
							>
								<Blocks className="h-4 w-4 text-outline" />
								<span className="truncate font-medium">{b.name}</span>
								<span className="ml-auto text-xs text-outline">{layerLabel(b.layer)}</span>
							</CommandItem>
						))}
					</CommandGroup>
					{blueprints.length === 0 && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Search">
								<CommandItem onSelect={() => goSearch('')}>
									<Search className="h-4 w-4 text-outline" />
									{m.nav_all()}
									<ArrowRight className="ml-auto h-4 w-4 text-outline" />
								</CommandItem>
							</CommandGroup>
						</>
					)}
				</CommandList>
				<div className="flex items-center justify-between border-t border-outline-variant/70 px-4 py-2.5 text-[11px] text-outline">
					<span className="font-medium">{m.app_title()}</span>
					<span className="flex items-center gap-1">
						<kbd className="rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono">
							ESC
						</kbd>
						to close
					</span>
				</div>
			</Command>
		</Dialog>
	);
}
