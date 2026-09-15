import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, unwrapResponse } from '../lib/api.js';
import * as m from '../paraglide/messages.js';

export function useBlueprintMatches(blueprintId: string) {
	return useQuery({
		queryKey: ['blueprint-matches', blueprintId],
		queryFn: async () => {
			const res = await api.api.blueprints[':id'].matches.$get({
				param: { id: blueprintId },
			});
			return unwrapResponse(res);
		},
		enabled: !!blueprintId,
	});
}

export function useComputeMatches(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const res = await api.api.blueprints[':id'].matches.compute.$post({
				param: { id: blueprintId },
			});
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprint-matches', blueprintId] });
			toast.success(m.toast_match_status());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useUpdateMatch(blueprintId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			matchId,
			status,
		}: {
			matchId: string;
			status: 'confirmed' | 'dismissed';
		}) => {
			const res = await api.api.matches[':matchId'].$put({
				param: { matchId },
				json: { status },
			});
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blueprint-matches', blueprintId] });
		},
	});
}
