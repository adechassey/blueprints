import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { useProjects } from '../../hooks/useProjects.js';
import { apiFetch } from '../../lib/api.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/projects')({
	component: AdminProjectsPage,
});

function AdminProjectsPage() {
	const queryClient = useQueryClient();
	// biome-ignore lint/suspicious/noExplicitAny: API response shape
	const { data: projectList, isLoading } = useProjects() as any;

	const deleteMutation = useMutation({
		mutationFn: (id: string) => apiFetch(`/admin/projects/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
		},
	});

	const handleDelete = (id: string, name: string) => {
		if (!confirm(m.admin_confirm_delete_project({ name }))) return;
		deleteMutation.mutate(id);
	};

	return (
		<ProtectedRoute>
			<h1 className="mb-6 text-2xl font-bold">{m.admin_manage_projects()}</h1>

			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : projectList?.length ? (
				<div className="space-y-2">
					{projectList.map(
						(p: { id: string; name: string; slug: string; description?: string }) => (
							<div
								key={p.id}
								className="flex items-center justify-between rounded border bg-white p-4"
							>
								<div>
									<p className="font-medium">{p.name}</p>
									<p className="text-sm text-gray-500">{p.slug}</p>
									{p.description && <p className="text-sm text-gray-400">{p.description}</p>}
								</div>
								<button
									type="button"
									onClick={() => handleDelete(p.id, p.name)}
									className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
								>
									{m.blueprint_detail_delete()}
								</button>
							</div>
						),
					)}
				</div>
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</ProtectedRoute>
	);
}
