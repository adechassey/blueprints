import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

interface BlueprintListFilters {
	page?: number;
	limit?: number;
	stack?: string;
	layer?: string;
	tag?: string;
	projectId?: string;
	authorId?: string;
}

export function useBlueprints(filters: BlueprintListFilters = {}) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== '') {
			params.set(key, String(value));
		}
	}
	const query = params.toString();

	return useQuery({
		queryKey: ['blueprints', filters],
		queryFn: () =>
			apiFetch<{ items: unknown[]; total: number; page: number; limit: number }>(
				`/blueprints${query ? `?${query}` : ''}`,
			),
	});
}

export function useBlueprint(id: string) {
	return useQuery({
		queryKey: ['blueprint', id],
		queryFn: () => apiFetch(`/blueprints/${id}`),
		enabled: !!id,
	});
}

export function useBlueprintVersions(id: string) {
	return useQuery({
		queryKey: ['blueprint-versions', id],
		queryFn: () => apiFetch(`/blueprints/${id}/versions`),
		enabled: !!id,
	});
}

export function useCreateBlueprint() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			apiFetch('/blueprints', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
		},
	});
}

export function useUpdateBlueprint(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			apiFetch(`/blueprints/${id}`, {
				method: 'PUT',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
			queryClient.invalidateQueries({ queryKey: ['blueprint', id] });
		},
	});
}

export function useDeleteBlueprint() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiFetch(`/blueprints/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
		},
	});
}
