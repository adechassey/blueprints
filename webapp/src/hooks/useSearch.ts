import { useQuery } from '@tanstack/react-query';
import { api, unwrapResponse } from '../lib/api.js';

interface SearchFilters {
	stack?: string;
	layer?: string;
	tag?: string;
	limit?: number;
	offset?: number;
}

export function useSearch(query: string, filters: SearchFilters = {}) {
	return useQuery({
		queryKey: ['search', query, filters],
		queryFn: async () => {
			const extraParams: Record<string, string> = {};
			for (const [key, value] of Object.entries(filters)) {
				if (value !== undefined && value !== '') {
					extraParams[key] = String(value);
				}
			}
			const res = await api.api.blueprints.search.$get({ query: { q: query, ...extraParams } });
			return unwrapResponse(res);
		},
		enabled: query.length > 0,
	});
}
