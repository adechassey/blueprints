import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlueprintForm, type BlueprintFormData } from '../../components/BlueprintForm.js';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { useCreateBlueprint } from '../../hooks/useBlueprints.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/blueprints/new')({
	component: NewBlueprintPage,
});

function NewBlueprintPage() {
	const createMutation = useCreateBlueprint();
	const navigate = useNavigate();

	const handleSubmit = async (data: BlueprintFormData) => {
		await createMutation.mutateAsync({ ...data, isPublic: true });
		navigate({ to: '/' });
	};

	return (
		<ProtectedRoute>
			<div className="max-w-[1000px] mx-auto">
				<h1 className="mb-8 text-4xl font-black font-headline tracking-tight text-on-surface">
					{m.blueprint_create_title()}
				</h1>
				<BlueprintForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
			</div>
		</ProtectedRoute>
	);
}
