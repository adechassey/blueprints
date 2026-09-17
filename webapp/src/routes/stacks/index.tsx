import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Layers, Plus } from 'lucide-react';
import { useState } from 'react';
import { StackDialog } from '../../components/StackDialog.js';
import { Badge } from '../../components/ui/badge.js';
import { Button } from '../../components/ui/button.js';
import { EmptyState } from '../../components/ui/empty.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useCreateStack, useStacks } from '../../hooks/useStacks.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/stacks/')({
	component: StacksPage,
});

/** Technology badges shown on a stack card before collapsing into "+N". */
const VISIBLE_TECHNOLOGIES = 6;

function StacksPage() {
	const { data: stacks, isLoading } = useStacks();
	const createMutation = useCreateStack();
	const navigate = useNavigate();
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="space-y-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="space-y-2">
					<h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
						{m.stacks_title()}
					</h1>
					<p className="max-w-2xl text-on-surface-variant">{m.stacks_intro()}</p>
				</div>
				<Button variant="primary" onClick={() => setDialogOpen(true)}>
					<Plus className="h-4 w-4" />
					{m.stack_create_title()}
				</Button>
			</header>

			{isLoading ? (
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
						<Skeleton key={i} className="h-44" />
					))}
				</div>
			) : stacks?.length ? (
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{stacks.map((stack) => {
						const hidden = stack.technologies.length - VISIBLE_TECHNOLOGIES;
						return (
							<Link
								key={stack.id}
								to="/stacks/$slug"
								params={{ slug: stack.slug }}
								className="group flex flex-col rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 no-underline shadow-rest transition-all duration-200 hover:-translate-y-0.5 hover:border-outline hover:shadow-hover"
							>
								<div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary transition-colors group-hover:bg-tertiary group-hover:text-on-tertiary">
									<Layers className="h-4.5 w-4.5" />
								</div>
								<h2 className="mb-1.5 font-headline text-base font-bold text-on-surface transition-colors group-hover:text-primary">
									{stack.name}
								</h2>
								{stack.description && (
									<p className="mb-4 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
										{stack.description}
									</p>
								)}
								<div className="mt-auto flex flex-wrap gap-1.5">
									{stack.technologies.slice(0, VISIBLE_TECHNOLOGIES).map((t) => (
										<Badge key={t.slug} variant="secondary">
											{t.name}
										</Badge>
									))}
									{hidden > 0 && <Badge>+{hidden}</Badge>}
								</div>
							</Link>
						);
					})}
				</div>
			) : (
				<EmptyState
					icon={Layers}
					title={m.stacks_empty_title()}
					description={m.stacks_intro()}
					action={
						<Button variant="primary" onClick={() => setDialogOpen(true)}>
							<Plus className="h-4 w-4" />
							{m.stack_create_title()}
						</Button>
					}
				/>
			)}

			<StackDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				title={m.stack_create_title()}
				isSubmitting={createMutation.isPending}
				onSubmit={async (data) => {
					const stack = await createMutation.mutateAsync(data);
					navigate({ to: '/stacks/$slug', params: { slug: stack.slug } });
				}}
			/>
		</div>
	);
}
