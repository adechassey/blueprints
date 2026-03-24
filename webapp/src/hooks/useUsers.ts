import { useQuery } from '@tanstack/react-query';
import { api, unwrapResponse } from '../lib/api.js';

export function useUser(id: string) {
	return useQuery({
		queryKey: ['user', id],
		queryFn: async () => {
			const res = await api.api.users[':id'].$get({ param: { id } });
			return unwrapResponse(res);
		},
		enabled: !!id,
	});
}

export function useUserBlueprints(id: string) {
	return useQuery({
		queryKey: ['user-blueprints', id],
		queryFn: async () => {
			const res = await api.api.users[':id'].blueprints.$get({ param: { id } });
			return unwrapResponse(res);
		},
		enabled: !!id,
	});
}

export function useCurrentUser() {
	return useQuery({
		queryKey: ['current-user'],
		queryFn: async () => {
			const res = await api.api.users.me.$get();
			return unwrapResponse(res);
		},
		retry: false,
	});
}
