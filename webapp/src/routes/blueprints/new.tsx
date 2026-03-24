import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlueprintForm } from '../../components/BlueprintForm.js';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { useCreateBlueprint } from '../../hooks/useBlueprints.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/blueprints/new')({
	component: NewBlueprintPage,
});

function NewBlueprintPage() {
	const createMutation = useCreateBlueprint();
	const navigate = useNavigate();

	const handleSubmit = async (data: Record<string, unknown>) => {
		await createMutation.mutateAsync(data);
		navigate({ to: '/' });
	};

	return (
		<ProtectedRoute>
			<h1 className="mb-6 text-2xl font-bold text-gray-900">{m.blueprint_create_title()}</h1>
			<BlueprintForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
		</ProtectedRoute>
	);
}
