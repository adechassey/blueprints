import { createFileRoute } from '@tanstack/react-router';
import { BlueprintList } from '../../components/BlueprintList.js';
import { useUser, useUserBlueprints } from '../../hooks/useUsers.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/users/$userId')({
	component: UserProfilePage,
});

function UserProfilePage() {
	const { userId } = Route.useParams();
	const { data: user, isLoading: userLoading } = useUser(userId);
	const { data: blueprintsData, isLoading: bpLoading } = useUserBlueprints(userId);

	if (userLoading) return <p className="text-sm text-gray-500">{m.loading()}</p>;
	if (!user || 'error' in user) return <p className="text-sm text-gray-500">{m.empty_state()}</p>;

	const roleBadge: Record<string, string> = {
		admin: 'bg-red-100 text-red-700',
		maintainer: 'bg-yellow-100 text-yellow-700',
		user: 'bg-gray-100 text-gray-600',
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				{user.image && <img src={user.image} alt="" className="h-16 w-16 rounded-full" />}
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
					<div className="mt-1 flex items-center gap-2">
						<span
							className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[user.role ?? 'user'] || roleBadge.user}`}
						>
							{user.role}
						</span>
						<span className="text-sm text-gray-500">
							{m.profile_joined({ date: new Date(user.createdAt).toLocaleDateString() })}
						</span>
					</div>
				</div>
			</div>

			<div>
				<h2 className="mb-4 text-lg font-semibold">{m.profile_blueprints()}</h2>
				{bpLoading ? (
					<p className="text-sm text-gray-500">{m.loading()}</p>
				) : blueprintsData?.items?.length ? (
					<BlueprintList blueprints={blueprintsData.items} />
				) : (
					<p className="text-sm text-gray-500">{m.profile_no_blueprints()}</p>
				)}
			</div>
		</div>
	);
}
