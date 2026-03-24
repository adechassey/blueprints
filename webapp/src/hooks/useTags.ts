import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

interface Tag {
	id: string;
	name: string;
	slug: string;
	count: number;
}

export function useTags() {
	return useQuery({
		queryKey: ['tags'],
		queryFn: () => apiFetch<Tag[]>('/tags'),
	});
}
