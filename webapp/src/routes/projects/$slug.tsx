import { createFileRoute } from '@tanstack/react-router';
import { BlueprintList } from '../../components/BlueprintList.js';
import { useProject } from '../../hooks/useProjects.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/projects/$slug')({
	component: ProjectDetailPage,
});

function ProjectDetailPage() {
	const { slug } = Route.useParams();
	const { data: project, isLoading } = useProject(slug);

	if (isLoading) return <p className="text-sm text-gray-500">{m.loading()}</p>;
	if (!project || 'error' in project)
		return <p className="text-sm text-gray-500">{m.empty_state()}</p>;

	return (
		<>
			<h1 className="mb-2 text-2xl font-bold text-gray-900">{project.name}</h1>
			{project.description && <p className="mb-6 text-gray-600">{project.description}</p>}
			{project.blueprints?.length ? (
				<BlueprintList blueprints={project.blueprints} />
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</>
	);
}
