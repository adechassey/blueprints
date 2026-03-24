import { createFileRoute, Link } from '@tanstack/react-router';
import { useProjects } from '../../hooks/useProjects.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/projects/')({
	component: ProjectsPage,
});

function ProjectsPage() {
	// biome-ignore lint/suspicious/noExplicitAny: API response shape
	const { data: projects, isLoading } = useProjects() as any;

	return (
		<>
			<h1 className="mb-6 text-2xl font-bold text-gray-900">{m.projects_title()}</h1>
			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : projects?.length ? (
				<div className="grid gap-3 sm:grid-cols-2">
					{projects.map((p) => (
						<Link
							key={p.id}
							to="/projects/$slug"
							params={{ slug: p.slug }}
							className="block rounded-lg border bg-white p-4 no-underline hover:shadow-sm"
						>
							<h3 className="font-medium text-gray-900">{p.name}</h3>
							{p.description && <p className="mt-1 text-sm text-gray-500">{p.description}</p>}
						</Link>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</>
	);
}
