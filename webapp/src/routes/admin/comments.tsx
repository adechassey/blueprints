import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { useAdminComments, useAdminDeleteComment } from '../../hooks/useAdmin.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/comments')({
	component: AdminCommentsPage,
});

function AdminCommentsPage() {
	const { data: commentList, isLoading } = useAdminComments();
	const deleteMutation = useAdminDeleteComment();

	const handleDelete = (id: string) => {
		if (!confirm(m.admin_confirm_delete_comment())) return;
		deleteMutation.mutate(id);
	};

	return (
		<ProtectedRoute>
			<h1 className="mb-6 text-2xl font-bold">{m.admin_manage_comments()}</h1>

			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : commentList?.length ? (
				<div className="space-y-2">
					{commentList.map((c) => (
						<div
							key={c.id}
							className="flex items-center justify-between rounded border bg-white p-4"
						>
							<div className="flex-1">
								<p className="text-sm">{c.content}</p>
								<p className="text-xs text-gray-400">
									{c.authorName || m.comment_anonymous()} &middot;{' '}
									{new Date(c.createdAt).toLocaleDateString()}
								</p>
							</div>
							<button
								type="button"
								onClick={() => handleDelete(c.id)}
								className="ml-4 rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
							>
								{m.comment_delete()}
							</button>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</ProtectedRoute>
	);
}
