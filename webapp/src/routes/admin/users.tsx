import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { useAdminUsers, useChangeRole } from '../../hooks/useAdmin.js';
import { authClient } from '../../lib/auth-client.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/users')({
	component: AdminUsersPage,
});

function AdminUsersPage() {
	// biome-ignore lint/suspicious/noExplicitAny: API response shape
	const { data: users, isLoading } = useAdminUsers() as any;
	const changeRole = useChangeRole();
	const { data: session } = authClient.useSession();
	const [search, setSearch] = useState('');

	const handleRoleChange = (userId: string, role: string) => {
		if (userId === session?.user?.id) {
			alert(m.admin_cannot_change_own_role());
			return;
		}
		if (!confirm(m.admin_confirm_role_change())) return;
		changeRole.mutate({ userId, role });
	};

	const filtered = users?.filter(
		(u: { name: string; email: string }) =>
			u.name.toLowerCase().includes(search.toLowerCase()) ||
			u.email.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<ProtectedRoute>
			<h1 className="mb-6 text-2xl font-bold">{m.admin_manage_users()}</h1>

			<input
				type="text"
				placeholder={m.admin_search_users()}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
			/>

			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : filtered?.length ? (
				<div className="space-y-2">
					{filtered.map(
						(user: {
							id: string;
							name: string;
							email: string;
							role: string;
							createdAt: string;
							blueprintCount: number;
						}) => (
							<div
								key={user.id}
								className="flex items-center justify-between rounded border bg-white p-4"
							>
								<div>
									<p className="font-medium">{user.name}</p>
									<p className="text-sm text-gray-500">{user.email}</p>
									<p className="text-xs text-gray-400">
										{m.profile_joined({
											date: new Date(user.createdAt).toLocaleDateString(),
										})}
										{' · '}
										{m.admin_user_blueprints({ count: user.blueprintCount ?? 0 })}
									</p>
								</div>
								<select
									value={user.role}
									onChange={(e) => handleRoleChange(user.id, e.target.value)}
									disabled={user.id === session?.user?.id}
									className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
								>
									<option value="user">user</option>
									<option value="maintainer">maintainer</option>
									<option value="admin">admin</option>
								</select>
							</div>
						),
					)}
				</div>
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</ProtectedRoute>
	);
}
