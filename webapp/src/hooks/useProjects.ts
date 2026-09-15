import type { CreateProjectInput } from '@blueprints/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, unwrapResponse } from '../lib/api.js';
import * as m from '../paraglide/messages.js';

export function useProjects() {
	return useQuery({
		queryKey: ['projects'],
		queryFn: async () => {
			const res = await api.api.projects.$get();
			return unwrapResponse(res);
		},
	});
}

export function useProject(slug: string) {
	return useQuery({
		queryKey: ['project', slug],
		queryFn: async () => {
			const res = await api.api.projects[':slug'].$get({ param: { slug } });
			return unwrapResponse(res);
		},
		enabled: !!slug,
	});
}

export function useCreateProject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateProjectInput) => {
			const res = await api.api.projects.$post({ json: data });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			toast.success(m.toast_project_created());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}
