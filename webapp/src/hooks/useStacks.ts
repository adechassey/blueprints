import type { CreateStackInput, UpdateStackInput } from '@blueprints/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, unwrapResponse } from '../lib/api.js';
import * as m from '../paraglide/messages.js';

export function useStacks() {
	return useQuery({
		queryKey: ['stacks'],
		queryFn: async () => {
			const res = await api.api.stacks.$get();
			return unwrapResponse(res);
		},
	});
}

export function useStack(slug: string) {
	return useQuery({
		queryKey: ['stack', slug],
		queryFn: async () => {
			const res = await api.api.stacks[':id'].$get({ param: { id: slug } });
			return unwrapResponse(res);
		},
		enabled: !!slug,
	});
}

export function useCreateStack() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateStackInput) => {
			const res = await api.api.stacks.$post({ json: data });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['stacks'] });
			toast.success(m.toast_stack_created());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useUpdateStack(slug: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: UpdateStackInput) => {
			const res = await api.api.stacks[':id'].$put({ param: { id: slug }, json: data });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['stacks'] });
			queryClient.invalidateQueries({ queryKey: ['stack', slug] });
			toast.success(m.toast_stack_updated());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useDeleteStack() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (slug: string) => {
			const res = await api.api.stacks[':id'].$delete({ param: { id: slug } });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['stacks'] });
			toast.success(m.toast_stack_deleted());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}
