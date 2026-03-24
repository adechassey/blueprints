import { createFileRoute, Link } from '@tanstack/react-router';
import { FolderOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/button.js';
import { Dialog, DialogFooter, DialogTitle } from '../../components/ui/dialog.js';
import { Input } from '../../components/ui/input.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { Textarea } from '../../components/ui/textarea.js';
import { useCreateProject, useProjects } from '../../hooks/useProjects.js';
import { authClient } from '../../lib/auth-client.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/projects/')({
	component: ProjectsPage,
});

function ProjectsPage() {
	const { data: projects, isLoading } = useProjects();
	const { data: session } = authClient.useSession();
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-5xl font-extrabold tracking-tight font-headline text-on-surface">
					{m.projects_title()}
				</h1>
				{session?.user && (
					<Button variant="primary" size="md" onClick={() => setDialogOpen(true)}>
						<Plus className="h-4 w-4" />
						{m.project_create_title()}
					</Button>
				)}
			</div>
			{isLoading ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
						<Skeleton key={i} className="h-40" />
					))}
				</div>
			) : projects?.length ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{projects.map((p) => (
						<Link
							key={p.id}
							to="/projects/$slug"
							params={{ slug: p.slug }}
							className="group block bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-rest hover:shadow-hover no-underline"
						>
							<div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary mb-4">
								<FolderOpen className="h-5 w-5" />
							</div>
							<h3 className="text-lg font-bold font-headline text-on-surface group-hover:text-primary transition-colors mb-2">
								{p.name}
							</h3>
							{p.description && (
								<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
									{p.description}
								</p>
							)}
						</Link>
					))}
				</div>
			) : (
				<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
			)}

			<CreateProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
		</div>
	);
}

function CreateProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const createMutation = useCreateProject();
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [description, setDescription] = useState('');

	const handleNameChange = (value: string) => {
		setName(value);
		setSlug(
			value
				.toLowerCase()
				.replace(/[^a-z0-9-\s]/g, '')
				.replace(/\s+/g, '-'),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await createMutation.mutateAsync({
			name,
			slug,
			description: description || undefined,
		});
		setName('');
		setSlug('');
		setDescription('');
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<form onSubmit={handleSubmit} className="space-y-4">
				<DialogTitle>{m.project_create_title()}</DialogTitle>

				<div className="space-y-2">
					<label htmlFor="proj-name" className="block text-sm font-semibold text-on-surface">
						{m.project_form_name()}
					</label>
					<Input
						id="proj-name"
						type="text"
						value={name}
						onChange={(e) => handleNameChange(e.target.value)}
						required
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="proj-slug" className="block text-sm font-semibold text-on-surface">
						{m.project_form_slug()}
					</label>
					<Input
						id="proj-slug"
						type="text"
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						pattern="^[a-z0-9-]+$"
						required
					/>
					<p className="text-xs text-on-surface-variant">{m.project_form_slug_hint()}</p>
				</div>

				<div className="space-y-2">
					<label htmlFor="proj-description" className="block text-sm font-semibold text-on-surface">
						{m.project_form_description()}
					</label>
					<Textarea
						id="proj-description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
					/>
				</div>

				<DialogFooter>
					<Button type="button" variant="ghost" size="md" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="primary" size="md" disabled={createMutation.isPending}>
						{createMutation.isPending ? m.form_submitting() : m.form_submit()}
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
}
