import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlueprintForm, type BlueprintFormData } from '../../../components/BlueprintForm.js';
import { ProtectedRoute } from '../../../components/ProtectedRoute.js';
import { useBlueprint, useUpdateBlueprint } from '../../../hooks/useBlueprints.js';
import * as m from '../../../paraglide/messages.js';

export const Route = createFileRoute('/blueprints/$blueprintId/edit')({
	component: EditBlueprintPage,
});

function EditBlueprintPage() {
	const { blueprintId } = Route.useParams();
	const { data: blueprint, isLoading } = useBlueprint(blueprintId);
	const updateMutation = useUpdateBlueprint(blueprintId);
	const navigate = useNavigate();

	if (isLoading) return <p className="text-sm text-gray-500">{m.loading()}</p>;
	if (!blueprint || 'error' in blueprint)
		return <p className="text-sm text-gray-500">{m.empty_state()}</p>;

	const handleSubmit = async (data: BlueprintFormData) => {
		await updateMutation.mutateAsync(data);
		navigate({ to: '/blueprints/$blueprintId', params: { blueprintId } });
	};

	return (
		<ProtectedRoute>
			<h1 className="mb-6 text-2xl font-bold text-gray-900">{m.blueprint_edit_title()}</h1>
			<BlueprintForm
				initialValues={{
					name: blueprint.name,
					description: blueprint.description ?? undefined,
					usage: blueprint.usage ?? undefined,
					stack: blueprint.stack,
					layer: blueprint.layer,
					tags: blueprint.tags?.map((t: { name: string }) => t.name),
					content: blueprint.currentVersion?.content ?? '',
					projectId: blueprint.projectId ?? undefined,
				}}
				onSubmit={handleSubmit}
				isSubmitting={updateMutation.isPending}
				showChangelog
			/>
		</ProtectedRoute>
	);
}
