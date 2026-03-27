import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlueprintForm, type BlueprintFormData } from '../../../components/BlueprintForm.js';
import { ProtectedRoute } from '../../../components/ProtectedRoute.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
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

	if (isLoading) {
		return (
			<div className="max-w-[1000px] mx-auto space-y-6">
				<Skeleton className="h-12 w-64" />
				<Skeleton className="h-96 w-full" />
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

	const handleSubmit = async (data: BlueprintFormData) => {
		await updateMutation.mutateAsync(data);
		navigate({ to: '/blueprints/$blueprintId', params: { blueprintId } });
	};

	return (
		<ProtectedRoute>
			<div className="max-w-[1000px] mx-auto">
				<h1 className="mb-8 text-4xl font-black font-headline tracking-tight text-on-surface">
					{m.blueprint_edit_title()}
				</h1>
				<BlueprintForm
					initialValues={{
						name: blueprint.name,
						description: blueprint.description ?? undefined,
						usage: blueprint.usage ?? undefined,
						stack: blueprint.stack,
						layer: blueprint.layer,
						tags: blueprint.tags?.map((t: { name: string }) => t.name),
						content: blueprint.currentVersion?.content ?? '',
						projectId: blueprint.projects?.[0]?.id ?? undefined,
					}}
					onSubmit={handleSubmit}
					isSubmitting={updateMutation.isPending}
					showChangelog
				/>
			</div>
		</ProtectedRoute>
	);
}
