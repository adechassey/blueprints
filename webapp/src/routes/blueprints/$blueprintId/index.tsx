import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Copy, FolderOpen, GitFork, Info, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CommentSection } from '../../../components/CommentSection.js';
import { LayerBadge } from '../../../components/LayerBadge.js';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer.js';
import { MatchSection } from '../../../components/MatchSection.js';
import { markBlueprintViewed } from '../../../components/Onboarding.js';
import { Badge } from '../../../components/ui/badge.js';
import { Button } from '../../../components/ui/button.js';
import { Card, CardContent } from '../../../components/ui/card.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../../components/ui/dialog.js';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../../components/ui/select.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import {
	useBlueprint,
	useBlueprintVersions,
	useDeleteBlueprint,
	useForkBlueprint,
} from '../../../hooks/useBlueprints.js';
import { useProjects } from '../../../hooks/useProjects.js';
import { api } from '../../../lib/api.js';
import { authClient } from '../../../lib/auth-client.js';
import { formatDate } from '../../../lib/format-date.js';
import { cn } from '../../../lib/utils.js';
import * as m from '../../../paraglide/messages.js';

const filterLinkClass =
	'inline-flex no-underline rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

export const Route = createFileRoute('/blueprints/$blueprintId/')({
	component: BlueprintDetailPage,
});

function useMarkBlueprintViewed() {
	useEffect(() => {
		markBlueprintViewed();
	}, []);
}

function BlueprintDetailPage() {
	useMarkBlueprintViewed();
	const { blueprintId } = Route.useParams();
	const { data: blueprint, isLoading } = useBlueprint(blueprintId);
	const { data: versions } = useBlueprintVersions(blueprintId);
	const { data: session } = authClient.useSession();
	const deleteMutation = useDeleteBlueprint();
	const navigate = useNavigate();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showForkDialog, setShowForkDialog] = useState(false);

	if (isLoading) {
		return (
			<div className="max-w-[1000px] mx-auto space-y-8">
				<Skeleton className="h-16 w-3/4" />
				<Skeleton className="h-6 w-1/2" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!blueprint || 'error' in blueprint) {
		return (
			<div className="max-w-[1000px] mx-auto">
				<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
			</div>
		);
	}

	const isOwner = session?.user?.id === blueprint.authorId;
	const isAdmin = session?.user?.role === 'admin';
	const canEdit = isOwner || isAdmin;

	const handleDelete = async () => {
		await deleteMutation.mutateAsync(blueprintId);
		navigate({ to: '/' });
	};

	const handleCopy = async () => {
		if (blueprint.currentVersion?.content) {
			await navigator.clipboard.writeText(blueprint.currentVersion.content);
			toast.success(m.blueprint_detail_copy(), {
				description: blueprint.name,
			});
			api.api.blueprints[':id'].download
				.$post({ param: { id: blueprintId } })
				.catch((err: Error) => {
					console.warn('Download tracking failed:', err.message);
				});
		}
	};

	return (
		<div className="max-w-[1000px] mx-auto space-y-12">
			{/* Header Section */}
			<section className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
					<div className="space-y-2">
						<h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface tracking-tight">
							{blueprint.name}
						</h1>
						{blueprint.description && (
							<p className="text-base text-on-surface-variant max-w-2xl leading-relaxed">
								{blueprint.description}
							</p>
						)}
					</div>
					<div className="flex gap-2 shrink-0">
						<Button variant="secondary" size="sm" onClick={handleCopy}>
							<Copy className="h-4 w-4" />
							{m.blueprint_detail_copy()}
						</Button>
						<Button variant="secondary" size="sm" onClick={() => setShowForkDialog(true)}>
							<GitFork className="h-4 w-4" />
							{m.blueprint_fork()}
						</Button>
						{canEdit && (
							<>
								<a href={`/blueprints/${blueprintId}/edit`} className="no-underline">
									<Button variant="secondary" size="sm">
										<Pencil className="h-4 w-4" />
										{m.blueprint_detail_edit()}
									</Button>
								</a>
								<Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
									<Trash2 className="h-4 w-4" />
									{m.blueprint_detail_delete()}
								</Button>
							</>
						)}
					</div>
				</div>

				{blueprint.forkedFrom && (
					<p className="flex items-center gap-1.5 text-sm text-on-surface-variant">
						<GitFork className="h-3.5 w-3.5" />
						<Link
							to="/blueprints/$blueprintId"
							params={{ blueprintId: blueprint.forkedFrom.id }}
							className="text-primary no-underline hover:underline"
						>
							{m.blueprint_forked_from({
								name: blueprint.forkedFrom.name,
								project: blueprint.forkedFrom.projectSlug ?? '—',
							})}
						</Link>
					</p>
				)}

				{/* Layer, technologies and tags — each opens the matching filtered listing */}
				<div className="flex flex-wrap items-center gap-2">
					<Link to="/" search={{ layer: blueprint.layer }} className={filterLinkClass}>
						<LayerBadge layer={blueprint.layer} />
					</Link>
					{blueprint.technologies?.map((t: { name: string; slug: string }) => (
						<Link key={t.slug} to="/" search={{ techno: t.slug }} className={filterLinkClass}>
							<Badge variant="secondary">{t.name}</Badge>
						</Link>
					))}
					{blueprint.tags?.map((tag: { name: string }) => (
						<Link key={tag.name} to="/" search={{ tag: tag.name }} className={filterLinkClass}>
							<Badge variant="default">#{tag.name}</Badge>
						</Link>
					))}
					{blueprint.project && (
						<Link
							to="/projects/$slug"
							params={{ slug: blueprint.project.slug }}
							className={filterLinkClass}
						>
							<Badge variant="tertiary">
								<FolderOpen className="h-3 w-3" />
								{blueprint.project.name}
							</Badge>
						</Link>
					)}
					<span className="flex items-center text-xs text-on-surface-variant font-medium">
						{m.blueprint_detail_downloads({ count: blueprint.downloadCount ?? 0 })}
					</span>
					{blueprint.forkCount > 0 && (
						<span className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
							<GitFork className="h-3 w-3" />
							{blueprint.forkCount === 1
								? m.blueprint_fork_count_one({ count: blueprint.forkCount })
								: m.blueprint_fork_count_other({ count: blueprint.forkCount })}
						</span>
					)}
				</div>
			</section>

			{/* When to use */}
			{blueprint.usage && (
				<Card className="border border-outline-variant/15">
					<CardContent>
						<h3 className="font-headline text-xl font-extrabold mb-4 flex items-center gap-2">
							<Info className="h-5 w-5 text-primary" />
							When to use
						</h3>
						<p className="text-on-surface-variant leading-relaxed">{blueprint.usage}</p>
					</CardContent>
				</Card>
			)}

			{/* Reference implementation */}
			{blueprint.currentVersion && (
				<section className="space-y-6">
					<h3 className="font-headline text-2xl font-extrabold">Reference implementation</h3>
					<MarkdownRenderer content={blueprint.currentVersion.content} />
				</section>
			)}

			{/* Matches */}
			<MatchSection blueprintId={blueprintId} />

			{/* Bento Grid: Version History + Comments */}
			<div className="grid md:grid-cols-3 gap-6">
				{/* Version History */}
				<div className="md:col-span-1 space-y-4">
					<h3 className="font-headline text-xl font-extrabold">{m.blueprint_detail_versions()}</h3>
					{versions && !('error' in versions) && versions.length > 0 && (
						<div className="bg-surface-container-lowest rounded-xl p-1 space-y-1 border border-outline-variant/15">
							{versions.map(
								(
									v: {
										id: string;
										version: number;
										createdAt: string;
										changelog?: string | null;
									},
									index: number,
								) => (
									<div
										key={v.id}
										className={cn(
											'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all',
											index === 0
												? 'bg-surface-container-low text-primary font-bold'
												: 'text-on-surface-variant font-medium hover:bg-surface-container-low',
										)}
									>
										<div className="flex items-center gap-3">
											<span className="text-xs font-mono">
												{m.blueprint_detail_version({
													version: v.version,
												})}
											</span>
											{index === 0 && (
												<span className="text-xs text-on-surface-variant font-normal">Active</span>
											)}
										</div>
										<span className="text-xs">{formatDate(v.createdAt)}</span>
									</div>
								),
							)}
						</div>
					)}
				</div>

				{/* Comments */}
				<div className="md:col-span-2">
					<CommentSection blueprintId={blueprintId} />
				</div>
			</div>

			<ForkDialog
				open={showForkDialog}
				onClose={() => setShowForkDialog(false)}
				blueprintId={blueprintId}
				currentProjectId={blueprint.project?.id}
			/>

			{/* Delete confirmation dialog */}
			<Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
				<DialogTitle>{m.blueprint_detail_delete()}</DialogTitle>
				<DialogDescription>{m.blueprint_detail_confirm_delete()}</DialogDescription>
				<DialogFooter>
					<Button variant="secondary" size="sm" onClick={() => setShowDeleteDialog(false)}>
						Cancel
					</Button>
					<Button variant="destructive" size="sm" onClick={handleDelete}>
						<Trash2 className="h-4 w-4" />
						{m.blueprint_detail_delete()}
					</Button>
				</DialogFooter>
			</Dialog>
		</div>
	);
}

/** Picks the project the fork belongs to: a fork is a copy the project then owns. */
function ForkDialog({
	open,
	onClose,
	blueprintId,
	currentProjectId,
}: {
	open: boolean;
	onClose: () => void;
	blueprintId: string;
	currentProjectId: string | undefined;
}) {
	const { data: projects } = useProjects();
	const forkMutation = useForkBlueprint(blueprintId);
	const [projectId, setProjectId] = useState('');
	// A fork belongs to a project the user can publish into
	const targets = (projects ?? []).filter((p) => p.isMember && p.id !== currentProjectId);

	const handleFork = async () => {
		const fork = await forkMutation.mutateAsync(projectId);
		onClose();
		if (fork && 'id' in fork) window.location.assign(`/blueprints/${fork.id}`);
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>{m.blueprint_fork_title()}</DialogTitle>
			<DialogDescription>{m.blueprint_fork_hint()}</DialogDescription>
			<div className="space-y-2">
				<label htmlFor="fork-project" className="block text-sm font-semibold text-on-surface">
					{m.blueprint_fork_target()}
				</label>
				<Select value={projectId} onValueChange={setProjectId}>
					<SelectTrigger id="fork-project">
						<SelectValue placeholder={m.form_project_placeholder()} />
					</SelectTrigger>
					<SelectContent>
						{targets.map((p) => (
							<SelectItem key={p.id} value={p.id}>
								{p.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<DialogFooter>
				<Button variant="secondary" size="sm" onClick={onClose}>
					{m.dialog_cancel()}
				</Button>
				<Button
					variant="primary"
					size="sm"
					onClick={handleFork}
					disabled={!projectId || forkMutation.isPending}
				>
					<GitFork className="h-4 w-4" />
					{m.blueprint_fork()}
				</Button>
			</DialogFooter>
		</Dialog>
	);
}
