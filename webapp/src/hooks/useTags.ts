import { useQuery } from '@tanstack/react-query';
import { api, unwrapResponse } from '../lib/api.js';

export function useTags() {
	return useQuery({
		queryKey: ['tags'],
		queryFn: async () => {
			const res = await api.api.tags.$get();
			return unwrapResponse(res);
		},
	});
}
