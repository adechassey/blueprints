import { createFileRoute } from '@tanstack/react-router';
import { Blocks, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { ArchitectureEditor } from '../../components/ArchitectureEditor.js';
import { ArchitectureMap } from '../../components/ArchitectureMap.js';
import { Button } from '../../components/ui/button.js';
import { EmptyState } from '../../components/ui/empty.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useProject } from '../../hooks/useProjects.js';
import { authClient } from '../../lib/auth-client.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/projects/$slug')({
	component: ProjectDetailPage,
});

function ProjectDetailPage() {
	const { slug } = Route.useParams();
	const { data: project, isLoading } = useProject(slug);
	const { data: session } = authClient.useSession();
	const [editing, setEditing] = useState(false);

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

	// Mirrors PUT /api/projects/:id: the project's creator or an admin
	const canEdit = session?.user?.id === project.createdBy || session?.user?.role === 'admin';

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
				<section className="space-y-4">
					<div className="flex items-center justify-between gap-4">
						<h2 className="font-headline text-xl font-bold">{m.architecture_title()}</h2>
						{canEdit && !editing && (
							<Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
								<Settings2 className="h-4 w-4" />
								{m.architecture_configure()}
							</Button>
						)}
					</div>
					{editing ? (
						<ArchitectureEditor project={project} onClose={() => setEditing(false)} />
					) : (
						<ArchitectureMap blueprints={project.blueprints} architecture={project.architecture} />
					)}
				</section>
			) : (
				<EmptyState icon={Blocks} title={m.empty_state()} />
			)}
		</div>
	);
}
