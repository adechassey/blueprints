import { createFileRoute } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { Button } from '../../components/ui/button.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../components/ui/dialog.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useAdminDeleteProject } from '../../hooks/useAdmin.js';
import { useProjects } from '../../hooks/useProjects.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/projects')({
	component: AdminProjectsPage,
});

function AdminProjectsPage() {
	const { data: projectList, isLoading } = useProjects();
	const deleteMutation = useAdminDeleteProject();
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
					{m.admin_manage_projects()}
				</h1>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 3 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
							<Skeleton key={i} className="h-20" />
						))}
					</div>
				) : projectList?.length ? (
					<div className="space-y-2">
						{projectList.map((p) => (
							<div
								key={p.id}
								className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/15"
							>
								<div className="space-y-1">
									<p className="font-semibold text-on-surface">{p.name}</p>
									<p className="text-sm text-on-surface-variant">{p.slug}</p>
									{p.description && <p className="text-sm text-outline">{p.description}</p>}
								</div>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
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
						{deleteTarget ? m.admin_confirm_delete_project({ name: deleteTarget.name }) : ''}
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
