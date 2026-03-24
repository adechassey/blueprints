import { createFileRoute } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { Avatar } from '../../components/ui/avatar.js';
import { Badge } from '../../components/ui/badge.js';
import { Button } from '../../components/ui/button.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../components/ui/dialog.js';
import { Select } from '../../components/ui/select.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useAdminUsers, useChangeRole } from '../../hooks/useAdmin.js';
import { authClient } from '../../lib/auth-client.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/users')({
	component: AdminUsersPage,
});

const roleBadgeVariant: Record<string, 'error' | 'shared' | 'default'> = {
	admin: 'error',
	maintainer: 'shared',
	user: 'default',
};

function AdminUsersPage() {
	const { data: users, isLoading } = useAdminUsers();
	const changeRole = useChangeRole();
	const { data: session } = authClient.useSession();
	const [search, setSearch] = useState('');
	const [pendingRoleChange, setPendingRoleChange] = useState<{
		userId: string;
		role: string;
	} | null>(null);

	const handleRoleChange = (userId: string, role: string) => {
		if (userId === session?.user?.id) return;
		setPendingRoleChange({ userId, role });
	};

	const confirmRoleChange = () => {
		if (pendingRoleChange) {
			changeRole.mutate(pendingRoleChange);
			setPendingRoleChange(null);
		}
	};

	const filtered = users?.filter(
		(u) =>
			u.name.toLowerCase().includes(search.toLowerCase()) ||
			u.email.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<ProtectedRoute>
			<div className="space-y-6">
				<h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
					{m.admin_manage_users()}
				</h1>

				<div className="relative">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
					<input
						type="text"
						placeholder={m.admin_search_users()}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full pl-12 pr-4 py-3 bg-surface-container-high rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline"
					/>
				</div>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
							<Skeleton key={i} className="h-20" />
						))}
					</div>
				) : filtered?.length ? (
					<div className="space-y-2">
						{filtered.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/15"
							>
								<div className="flex items-center gap-4">
									<Avatar src={user.image} fallback={user.name} size="lg" />
									<div>
										<p className="font-semibold text-on-surface">{user.name}</p>
										<p className="text-sm text-on-surface-variant">{user.email}</p>
										<div className="flex items-center gap-2 mt-1">
											<Badge variant={roleBadgeVariant[user.role ?? 'user'] ?? 'default'}>
												{user.role}
											</Badge>
											<span className="text-xs text-outline">
												{m.profile_joined({
													date: new Date(user.createdAt).toLocaleDateString(),
												})}
												{' · '}
												{m.admin_user_blueprints({
													count: user.blueprintCount ?? 0,
												})}
											</span>
										</div>
									</div>
								</div>
								<Select
									value={user.role ?? 'user'}
									onChange={(e) => handleRoleChange(user.id, e.target.value)}
									disabled={user.id === session?.user?.id}
									className="w-auto"
								>
									<option value="user">user</option>
									<option value="maintainer">maintainer</option>
									<option value="admin">admin</option>
								</Select>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
				)}

				<Dialog open={!!pendingRoleChange} onClose={() => setPendingRoleChange(null)}>
					<DialogTitle>{m.admin_confirm_role_change()}</DialogTitle>
					<DialogDescription>This will change the user&apos;s permissions.</DialogDescription>
					<DialogFooter>
						<Button variant="secondary" size="sm" onClick={() => setPendingRoleChange(null)}>
							Cancel
						</Button>
						<Button variant="primary" size="sm" onClick={confirmRoleChange}>
							Confirm
						</Button>
					</DialogFooter>
				</Dialog>
			</div>
		</ProtectedRoute>
	);
}
