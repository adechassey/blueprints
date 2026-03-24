import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

export function useComments(blueprintId: string) {
	return useQuery({
		queryKey: ['comments', blueprintId],
		queryFn: () => apiFetch(`/blueprints/${blueprintId}/comments`),
		enabled: !!blueprintId,
	});
}

export function useCreateComment(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { content: string; parentId?: string }) =>
			apiFetch(`/blueprints/${blueprintId}/comments`, {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', blueprintId] });
		},
	});
}

export function useUpdateComment(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, content }: { id: string; content: string }) =>
			apiFetch(`/comments/${id}`, {
				method: 'PUT',
				body: JSON.stringify({ content }),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', blueprintId] });
		},
	});
}

export function useDeleteComment(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiFetch(`/comments/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', blueprintId] });
		},
	});
}
