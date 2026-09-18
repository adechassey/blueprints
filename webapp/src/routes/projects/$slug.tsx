import { createFileRoute } from '@tanstack/react-router';
import { Blocks } from 'lucide-react';
import { LayerSections } from '../../components/LayerSections.js';
import { EmptyState } from '../../components/ui/empty.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useProject } from '../../hooks/useProjects.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/projects/$slug')({
	component: ProjectDetailPage,
});

function ProjectDetailPage() {
	const { slug } = Route.useParams();
	const { data: project, isLoading } = useProject(slug);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-64" />
				<Skeleton className="h-6 w-96" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
					<Skeleton className="h-48" />
				</div>
			</div>
		);
	}

	if (!project || 'error' in project) {
		return (
			<div>
				<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-4xl font-black font-headline tracking-tight text-on-surface mb-2">
					{project.name}
				</h1>
				{project.description && (
					<p className="text-lg text-on-surface-variant leading-relaxed">{project.description}</p>
				)}
			</div>
			{project.blueprints?.length ? (
				<div className="space-y-8">
					<LayerSections blueprints={project.blueprints} />
				</div>
			) : (
				<EmptyState icon={Blocks} title={m.empty_state()} />
			)}
		</div>
	);
}
