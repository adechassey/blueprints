import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api.js';

interface AdminStats {
	users: number;
	blueprints: number;
	comments: number;
	projects: number;
}

export function useAdminStats() {
	return useQuery({
		queryKey: ['admin-stats'],
		queryFn: () => apiFetch<AdminStats>('/admin/stats'),
	});
}

interface AdminUser {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: string;
	createdAt: string;
}

export function useAdminUsers() {
	return useQuery({
		queryKey: ['admin-users'],
		queryFn: () => apiFetch<AdminUser[]>('/admin/users'),
	});
}

export function useChangeRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: string }) =>
			apiFetch(`/admin/users/${userId}/role`, {
				method: 'PUT',
				body: JSON.stringify({ role }),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] });
			queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
		},
	});
}
