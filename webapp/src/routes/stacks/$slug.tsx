import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Blocks, Layers, Pencil, Terminal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CopyButton } from '../../components/CopyButton.js';
import { LayerSections } from '../../components/LayerSections.js';
import { StackDialog } from '../../components/StackDialog.js';
import { Badge } from '../../components/ui/badge.js';
import { Button } from '../../components/ui/button.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../components/ui/dialog.js';
import { EmptyState } from '../../components/ui/empty.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useBlueprints } from '../../hooks/useBlueprints.js';
import { useDeleteStack, useStack, useUpdateStack } from '../../hooks/useStacks.js';
import { authClient } from '../../lib/auth-client.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/stacks/$slug')({
	component: StackDetailPage,
});

/** Page size of the blueprint listing (the API maximum). */
const BLUEPRINT_LIMIT = 100;

function StackDetailPage() {
	const { slug } = Route.useParams();
	const { data: stack, isLoading } = useStack(slug);
	const { data: session } = authClient.useSession();
	const updateMutation = useUpdateStack(slug);
	const deleteMutation = useDeleteStack();
	const navigate = useNavigate();
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	// Same any-match rule as the CLI scaffold feed: blueprints carrying one of the stack's technologies
	const techno =
		stack && !('error' in stack) ? stack.technologies.map((t) => t.slug).join(',') : '';
	const { data: blueprints, isLoading: blueprintsLoading } = useBlueprints(
		{ techno, limit: BLUEPRINT_LIMIT },
		{ enabled: techno !== '' },
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-72" />
				<Skeleton className="h-6 w-96" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	if (!stack || 'error' in stack) {
		return <p className="text-sm text-on-surface-variant">{m.empty_state()}</p>;
	}

	const canEdit = session?.user?.id === stack.createdBy || session?.user?.role === 'admin';
	const items = blueprints?.items ?? [];
	const scaffold = `theodo-blueprints stack scaffold ${stack.slug} ./blueprints`;

	const handleDelete = async () => {
		await deleteMutation.mutateAsync(stack.slug);
		navigate({ to: '/stacks' });
	};

	return (
		<div className="space-y-10">
			<header className="space-y-5">
				<Link
					to="/stacks"
					className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant no-underline hover:text-on-surface"
				>
					<Layers className="h-4 w-4" />
					{m.stacks_title()}
				</Link>
				<div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
					<div className="space-y-2">
						<h1 className="font-headline text-4xl font-black tracking-tight text-on-surface">
							{stack.name}
						</h1>
						{stack.description && (
							<p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
								{stack.description}
							</p>
						)}
					</div>
					{canEdit && (
						<div className="flex shrink-0 gap-2">
							<Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
								<Pencil className="h-4 w-4" />
								{m.blueprint_detail_edit()}
							</Button>
							<Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
								<Trash2 className="h-4 w-4" />
								{m.blueprint_detail_delete()}
							</Button>
						</div>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					{stack.technologies.map((t) => (
						<Link
							key={t.slug}
							to="/"
							search={{ techno: t.slug }}
							className="inline-flex rounded-md no-underline transition-opacity hover:opacity-80"
						>
							<Badge variant="secondary" className="px-2.5 py-1 text-xs">
								{t.name}
							</Badge>
						</Link>
					))}
				</div>
			</header>

			<section className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low">
				<div className="flex items-center justify-between gap-3 border-b border-outline-variant/50 bg-surface-container/60 py-1.5 pr-1.5 pl-4">
					<span className="flex items-center gap-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
						<Terminal className="h-3.5 w-3.5" />
						{m.stack_scaffold_title()}
					</span>
					<CopyButton code={scaffold} />
				</div>
				<pre className="overflow-x-auto p-4 text-sm">
					<code>
						<span aria-hidden="true" className="select-none text-primary/70">
							${' '}
						</span>
						{scaffold}
					</code>
				</pre>
				<p className="border-t border-outline-variant/50 px-4 py-2.5 text-xs text-on-surface-variant">
					{m.stack_scaffold_hint()}
				</p>
			</section>

			<section className="space-y-8">
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<h2 className="font-headline text-2xl font-extrabold">
						{m.stack_blueprints_title({ count: blueprints?.total ?? 0 })}
					</h2>
					{techno && (
						<Link
							to="/"
							search={{ techno }}
							className="inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:underline"
						>
							{m.stack_browse_all()}
							<ArrowRight className="h-4 w-4" />
						</Link>
					)}
				</div>

				{blueprintsLoading ? (
					<Skeleton className="h-48" />
				) : items.length ? (
					<LayerSections blueprints={items} />
				) : (
					<EmptyState icon={Blocks} title={m.stack_blueprints_empty()} />
				)}
			</section>

			<StackDialog
				open={editOpen}
				onClose={() => setEditOpen(false)}
				title={m.stack_edit_title()}
				initialValues={{
					name: stack.name,
					description: stack.description,
					technologies: stack.technologies.map((t) => t.slug),
				}}
				isSubmitting={updateMutation.isPending}
				onSubmit={(data) => updateMutation.mutateAsync(data)}
			/>

			<Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
				<DialogTitle>{m.blueprint_detail_delete()}</DialogTitle>
				<DialogDescription>{m.stack_confirm_delete({ name: stack.name })}</DialogDescription>
				<DialogFooter>
					<Button variant="secondary" size="sm" onClick={() => setDeleteOpen(false)}>
						{m.dialog_cancel()}
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDelete}
						disabled={deleteMutation.isPending}
					>
						<Trash2 className="h-4 w-4" />
						{m.blueprint_detail_delete()}
					</Button>
				</DialogFooter>
			</Dialog>
		</div>
	);
}
