import { createFileRoute } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { Badge } from '../../components/ui/badge.js';
import { Button } from '../../components/ui/button.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../components/ui/dialog.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useBlueprints, useDeleteBlueprint } from '../../hooks/useBlueprints.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/blueprints')({
	component: AdminBlueprintsPage,
});

function AdminBlueprintsPage() {
	const { data, isLoading } = useBlueprints({ limit: 100 });
	const deleteMutation = useDeleteBlueprint();
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

	const handleDelete = () => {
		if (deleteTarget) {
			deleteMutation.mutate(deleteTarget.id);
			setDeleteTarget(null);
		}
	};

	return (
		<ProtectedRoute>
			<div className="space-y-6">
				<h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
					{m.admin_manage_blueprints()}
				</h1>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
							<Skeleton key={i} className="h-20" />
						))}
					</div>
				) : data?.items?.length ? (
					<div className="space-y-2">
						{data.items.map((bp) => (
							<div
								key={bp.id}
								className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/15"
							>
								<div className="space-y-1">
									<p className="font-semibold text-on-surface">{bp.name}</p>
									<div className="flex items-center gap-2">
										<Badge
											variant={
												(bp.stack as 'webapp' | 'server' | 'shared' | 'fullstack') ?? 'default'
											}
										>
											{bp.stack}
										</Badge>
										<span className="text-sm text-on-surface-variant">{bp.slug}</span>
										<span className="text-sm text-outline">{bp.authorName || 'Unknown'}</span>
									</div>
								</div>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setDeleteTarget({ id: bp.id, name: bp.name })}
								>
									<Trash2 className="h-4 w-4" />
									{m.blueprint_detail_delete()}
								</Button>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
				)}

				<Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
					<DialogTitle>{m.blueprint_detail_delete()}</DialogTitle>
					<DialogDescription>
						{deleteTarget ? m.admin_confirm_delete_blueprint({ name: deleteTarget.name }) : ''}
					</DialogDescription>
					<DialogFooter>
						<Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={handleDelete}>
							<Trash2 className="h-4 w-4" />
							{m.blueprint_detail_delete()}
						</Button>
					</DialogFooter>
				</Dialog>
			</div>
		</ProtectedRoute>
	);
}
