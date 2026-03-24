import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { useBlueprints, useDeleteBlueprint } from '../../hooks/useBlueprints.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/blueprints')({
	component: AdminBlueprintsPage,
});

function AdminBlueprintsPage() {
	const { data, isLoading } = useBlueprints({ limit: 100 });
	const deleteMutation = useDeleteBlueprint();

	const handleDelete = (id: string, name: string) => {
		if (!confirm(m.admin_confirm_delete_blueprint({ name }))) return;
		deleteMutation.mutate(id);
	};

	return (
		<ProtectedRoute>
			<h1 className="mb-6 text-2xl font-bold">{m.admin_manage_blueprints()}</h1>

			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : data?.items?.length ? (
				<div className="space-y-2">
					{data.items.map((bp) => (
						<div
							key={bp.id}
							className="flex items-center justify-between rounded border bg-white p-4"
						>
							<div>
								<p className="font-medium">{bp.name}</p>
								<p className="text-sm text-gray-500">
									{bp.stack} &middot; {bp.slug} &middot; {bp.authorName || 'Unknown'}
								</p>
							</div>
							<button
								type="button"
								onClick={() => handleDelete(bp.id, bp.name)}
								className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
							>
								{m.blueprint_detail_delete()}
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
