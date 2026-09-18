import type { CreateBlueprintInput, UpdateBlueprintInput } from '@blueprints/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, unwrapResponse } from '../lib/api.js';
import * as m from '../paraglide/messages.js';

interface BlueprintListFilters {
	page?: number;
	limit?: number;
	techno?: string;
	layer?: string;
	tag?: string;
	projectId?: string;
	authorId?: string;
}

export function useBlueprints(
	filters: BlueprintListFilters = {},
	{ enabled = true }: { enabled?: boolean } = {},
) {
	return useQuery({
		queryKey: ['blueprints', filters],
		enabled,
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
			// Slugs are scoped by project; the webapp fetches by UUID, so no scope is needed
			const res = await api.api.blueprints[':id'].$get({ param: { id }, query: {} });
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
			toast.success(m.toast_blueprint_published());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useUpdateBlueprint(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: UpdateBlueprintInput) => {
			const res = await api.api.blueprints[':id'].$put({
				param: { id },
				query: {},
				json: data,
			});
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
			queryClient.invalidateQueries({ queryKey: ['blueprint', id] });
			toast.success(m.toast_blueprint_updated());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useForkBlueprint(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (projectId: string) => {
			const res = await api.api.blueprints[':id'].fork.$post({
				param: { id },
				query: {},
				json: { projectId },
			});
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
			queryClient.invalidateQueries({ queryKey: ['blueprint', id] });
			toast.success(m.toast_blueprint_forked());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useDeleteBlueprint() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.blueprints[':id'].$delete({ param: { id }, query: {} });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprints'] });
			toast.success(m.toast_blueprint_deleted());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}
