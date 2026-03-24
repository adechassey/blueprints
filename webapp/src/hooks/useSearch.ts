import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

interface SearchFilters {
	stack?: string;
	layer?: string;
	tag?: string;
	limit?: number;
	offset?: number;
}

export function useSearch(query: string, filters: SearchFilters = {}) {
	const params = new URLSearchParams();
	params.set('q', query);
	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== '') {
			params.set(key, String(value));
		}
	}

	return useQuery({
		queryKey: ['search', query, filters],
		queryFn: () =>
			apiFetch<{ items: unknown[]; total: number; query: string }>(
				`/blueprints/search?${params.toString()}`,
			),
		enabled: query.length > 0,
	});
}
