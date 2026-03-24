import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrapResponse } from '../lib/api.js';

export function useComments(blueprintId: string) {
	return useQuery({
		queryKey: ['comments', blueprintId],
		queryFn: async () => {
			const res = await api.api.blueprints[':id'].comments.$get({
				param: { id: blueprintId },
			});
			return unwrapResponse(res);
		},
		enabled: !!blueprintId,
	});
}

export function useCreateComment(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: { content: string; parentId?: string }) => {
			const res = await api.api.blueprints[':id'].comments.$post({
				param: { id: blueprintId },
				json: data,
			});
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', blueprintId] });
		},
	});
}

export function useUpdateComment(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, content }: { id: string; content: string }) => {
			const res = await api.api.comments[':id'].$put({
				param: { id },
				json: { content },
			});
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', blueprintId] });
		},
	});
}

export function useDeleteComment(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.comments[':id'].$delete({ param: { id } });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', blueprintId] });
		},
	});
}
