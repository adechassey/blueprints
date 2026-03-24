import { createFileRoute } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { Avatar } from '../../components/ui/avatar.js';
import { Button } from '../../components/ui/button.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../components/ui/dialog.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useAdminComments, useAdminDeleteComment } from '../../hooks/useAdmin.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/comments')({
	component: AdminCommentsPage,
});

function AdminCommentsPage() {
	const { data: commentList, isLoading } = useAdminComments();
	const deleteMutation = useAdminDeleteComment();
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

	const handleDelete = () => {
		if (deleteTarget) {
			deleteMutation.mutate(deleteTarget);
			setDeleteTarget(null);
		}
	};

	return (
		<ProtectedRoute>
			<div className="space-y-6">
				<h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
					{m.admin_manage_comments()}
				</h1>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
							<Skeleton key={i} className="h-16" />
						))}
					</div>
				) : commentList?.length ? (
					<div className="space-y-2">
						{commentList.map((c) => (
							<div
								key={c.id}
								className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/15"
							>
								<div className="flex items-center gap-4 flex-1 min-w-0">
									<Avatar fallback={c.authorName ?? '?'} size="md" />
									<div className="min-w-0 flex-1">
										<p className="text-sm text-on-surface truncate">{c.content}</p>
										<p className="text-xs text-outline mt-1">
											{c.authorName || m.comment_anonymous()} &middot;{' '}
											{new Date(c.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<Button
									variant="destructive"
									size="sm"
									className="ml-4 shrink-0"
									onClick={() => setDeleteTarget(c.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
				)}

				<Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
					<DialogTitle>{m.comment_delete()}</DialogTitle>
					<DialogDescription>{m.admin_confirm_delete_comment()}</DialogDescription>
					<DialogFooter>
						<Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
							Cancel
						</Button>
						<Button variant="destructive" size="sm" onClick={handleDelete}>
							<Trash2 className="h-4 w-4" />
							{m.comment_delete()}
						</Button>
					</DialogFooter>
				</Dialog>
			</div>
		</ProtectedRoute>
	);
}
