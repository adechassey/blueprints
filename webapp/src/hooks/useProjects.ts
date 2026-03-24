import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

interface Project {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	createdBy: string;
	createdAt: string;
}

export function useProjects() {
	return useQuery({
		queryKey: ['projects'],
		queryFn: () => apiFetch<Project[]>('/projects'),
	});
}

export function useProject(slug: string) {
	return useQuery({
		queryKey: ['project', slug],
		queryFn: () => apiFetch(`/projects/${slug}`),
		enabled: !!slug,
	});
}

export function useCreateProject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { name: string; slug: string; description?: string }) =>
			apiFetch('/projects', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
		},
	});
}
