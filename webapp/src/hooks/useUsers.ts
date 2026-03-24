import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

export function useUser(id: string) {
	return useQuery({
		queryKey: ['user', id],
		queryFn: () => apiFetch(`/users/${id}`),
		enabled: !!id,
	});
}

export function useUserBlueprints(id: string) {
	return useQuery({
		queryKey: ['user-blueprints', id],
		queryFn: () => apiFetch<{ items: unknown[] }>(`/users/${id}/blueprints`),
		enabled: !!id,
	});
}

export function useCurrentUser() {
	return useQuery({
		queryKey: ['current-user'],
		queryFn: () => apiFetch('/users/me'),
		retry: false,
	});
}
