import type { CreateBlueprintInput, UpdateBlueprintInput } from '@blueprints/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrapResponse } from '../lib/api.js';

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
	return useQuery({
		queryKey: ['blueprints', filters],
		queryFn: async () => {
			const query: Record<string, string> = {};
			for (const [key, value] of Object.entries(filters)) {
				if (value !== undefined && value !== '') {
					query[key] = String(value);
				}
			}
			const res = await api.api.blueprints.$get({ query });
			return unwrapResponse(res);
		},
	});
}

export function useBlueprint(id: string) {
	return useQuery({
		queryKey: ['blueprint', id],
		queryFn: async () => {
			const res = await api.api.blueprints[':id'].$get({ param: { id } });
			return unwrapResponse(res);
		},
		enabled: !!id,
	});
}

export function useBlueprintVersions(id: string) {
	return useQuery({
		queryKey: ['blueprint-versions', id],
		queryFn: async () => {
			const res = await api.api.blueprints[':id'].versions.$get({ param: { id } });
			return unwrapResponse(res);
		},
		enabled: !!id,
	});
}

export function useCreateBlueprint() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateBlueprintInput) => {
			const res = await api.api.blueprints.$post({ json: data });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
		},
	});
}

export function useUpdateBlueprint(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: UpdateBlueprintInput) => {
			const res = await api.api.blueprints[':id'].$put({
				param: { id },
				json: data,
			});
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
			queryClient.invalidateQueries({ queryKey: ['blueprint', id] });
		},
	});
}

export function useDeleteBlueprint() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.blueprints[':id'].$delete({ param: { id } });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
		},
	});
}
