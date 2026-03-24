import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Copy, Info, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CommentSection } from '../../components/CommentSection.js';
import { MarkdownRenderer } from '../../components/MarkdownRenderer.js';
import { MatchSection } from '../../components/MatchSection.js';
import { Badge } from '../../components/ui/badge.js';
import { Button } from '../../components/ui/button.js';
import { Card, CardContent } from '../../components/ui/card.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../components/ui/dialog.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import {
	useBlueprint,
	useBlueprintVersions,
	useDeleteBlueprint,
} from '../../hooks/useBlueprints.js';
import { api } from '../../lib/api.js';
import { authClient } from '../../lib/auth-client.js';
import { cn } from '../../lib/utils.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/blueprints/$blueprintId')({
	component: BlueprintDetailPage,
});

const stackVariant: Record<string, 'webapp' | 'server' | 'shared' | 'fullstack'> = {
	webapp: 'webapp',
	server: 'server',
	shared: 'shared',
	fullstack: 'fullstack',
};

function BlueprintDetailPage() {
	const { blueprintId } = Route.useParams();
	const { data: blueprint, isLoading } = useBlueprint(blueprintId);
	const { data: versions } = useBlueprintVersions(blueprintId);
	const { data: session } = authClient.useSession();
	const deleteMutation = useDeleteBlueprint();
	const navigate = useNavigate();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
							<p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
								{blueprint.description}
							</p>
						)}
					</div>
					<div className="flex gap-2 shrink-0">
						<Button variant="secondary" size="sm" onClick={handleCopy}>
							<Copy className="h-4 w-4" />
							{m.blueprint_detail_copy()}
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

				{/* Tags */}
				<div className="flex flex-wrap gap-3">
					<Badge variant={stackVariant[blueprint.stack] ?? 'default'}>{blueprint.stack}</Badge>
					<Badge variant="secondary">{blueprint.layer}</Badge>
					{blueprint.tags?.map((tag: { name: string }) => (
						<Badge key={tag.name} variant="default">
							{tag.name}
						</Badge>
					))}
					<span className="flex items-center text-xs text-on-surface-variant font-medium">
						{m.blueprint_detail_downloads({ count: blueprint.downloadCount ?? 0 })}
					</span>
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
												<span className="text-[10px] text-on-surface-variant font-normal">
													Active
												</span>
											)}
										</div>
										<span className="text-[10px]">
											{new Date(v.createdAt).toLocaleDateString()}
										</span>
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
