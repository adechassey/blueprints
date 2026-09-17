import { createFileRoute, Link } from '@tanstack/react-router';
import { Cpu } from 'lucide-react';
import { CATEGORY_LABEL } from '../components/TechnologyPicker.js';
import { EmptyState } from '../components/ui/empty.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { useTechnologies } from '../hooks/useTags.js';
import { groupByCategory } from '../lib/technologies.core.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/technologies')({
	component: TechnologiesPage,
});

function TechnologiesPage() {
	const { data: technologies, isLoading } = useTechnologies();
	const groups = groupByCategory(technologies ?? []);

	return (
		<div className="space-y-10">
			<header className="space-y-2">
				<h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
					{m.technologies_title()}
				</h1>
				<p className="max-w-2xl text-on-surface-variant">{m.technologies_intro()}</p>
			</header>

			{isLoading ? (
				<div className="flex flex-wrap gap-3">
					{Array.from({ length: 10 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
						<Skeleton key={i} className="h-10 w-32 rounded-lg" />
					))}
				</div>
			) : groups.length ? (
				groups.map((group) => (
					<section key={group.category} className="space-y-3">
						<h2 className="text-xs font-semibold tracking-wider text-outline uppercase">
							{CATEGORY_LABEL[group.category]()}
						</h2>
						<div className="flex flex-wrap gap-2.5">
							{group.technologies.map((t) => (
								<Link
									key={t.id}
									to="/"
									search={{ techno: t.slug }}
									className="group inline-flex items-center gap-2.5 rounded-lg border border-outline-variant/70 bg-surface-container-lowest px-3.5 py-2 text-sm font-semibold text-on-surface no-underline shadow-rest transition-all hover:border-primary/40 hover:text-primary"
								>
									{t.name}
									<span className="rounded-md bg-surface-container-high px-1.5 py-0.5 text-xs font-medium tabular-nums text-on-surface-variant transition-colors group-hover:bg-primary/10 group-hover:text-primary">
										{t.count}
									</span>
								</Link>
							))}
						</div>
					</section>
				))
			) : (
				<EmptyState icon={Cpu} title={m.technologies_empty()} />
			)}
		</div>
	);
}
