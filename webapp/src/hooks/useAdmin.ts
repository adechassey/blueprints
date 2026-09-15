import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, unwrapResponse } from '../lib/api.js';
import * as m from '../paraglide/messages.js';

export function useAdminStats() {
	return useQuery({
		queryKey: ['admin-stats'],
		queryFn: async () => {
			const res = await api.api.admin.stats.$get();
			return unwrapResponse(res);
		},
	});
}

export function useAdminUsers() {
	return useQuery({
		queryKey: ['admin-users'],
		queryFn: async () => {
			const res = await api.api.admin.users.$get();
			return unwrapResponse(res);
		},
	});
}

export function useAdminComments() {
	return useQuery({
		queryKey: ['admin-comments'],
		queryFn: async () => {
			const res = await api.api.admin.comments.$get();
			return unwrapResponse(res);
		},
	});
}

export function useChangeRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
			const res = await api.api.admin.users[':id'].role.$put({
				param: { id: userId },
				json: { role: role as 'admin' | 'maintainer' | 'user' },
			});
			return unwrapResponse(res);
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] });
			queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
			toast.success(m.toast_role_changed({ role: variables.role }));
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useAdminDeleteComment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.admin.comments[':id'].$delete({ param: { id } });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
			queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
			toast.success(m.toast_comment_deleted());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}

export function useAdminDeleteProject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.api.admin.projects[':id'].$delete({ param: { id } });
			return unwrapResponse(res);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['projects'] });
			queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
			toast.success(m.toast_project_deleted());
		},
		onError: (error) => {
			toast.error(m.toast_error(), { description: error.message });
		},
	});
}
