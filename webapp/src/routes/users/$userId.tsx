import { createFileRoute } from '@tanstack/react-router';
import { BlueprintList } from '../../components/BlueprintList.js';
import { Avatar } from '../../components/ui/avatar.js';
import { Badge } from '../../components/ui/badge.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useUser, useUserBlueprints } from '../../hooks/useUsers.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/users/$userId')({
	component: UserProfilePage,
});

const roleBadgeVariant: Record<string, 'error' | 'shared' | 'default'> = {
	admin: 'error',
	maintainer: 'shared',
	user: 'default',
};

function UserProfilePage() {
	const { userId } = Route.useParams();
	const { data: user, isLoading: userLoading } = useUser(userId);
	const { data: blueprintsData, isLoading: bpLoading } = useUserBlueprints(userId);

	if (userLoading) {
		return (
			<div className="max-w-[1000px] mx-auto space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-16 w-16 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
			</div>
		);
	}

	if (!user || 'error' in user) {
		return (
			<div className="max-w-[1000px] mx-auto">
				<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
			</div>
		);
	}

	return (
		<div className="max-w-[1000px] mx-auto space-y-8">
			<div className="flex items-center gap-6">
				<Avatar src={user.image} fallback={user.name ?? ''} size="xl" />
				<div className="space-y-2">
					<h1 className="text-3xl font-black font-headline tracking-tight text-on-surface">
						{user.name}
					</h1>
					<div className="flex items-center gap-3">
						<Badge variant={roleBadgeVariant[user.role ?? 'user'] ?? 'default'}>{user.role}</Badge>
						<span className="text-sm text-on-surface-variant">
							{m.profile_joined({
								date: new Date(user.createdAt).toLocaleDateString(),
							})}
						</span>
					</div>
				</div>
			</div>

			<div className="space-y-6">
				<h2 className="text-2xl font-extrabold font-headline">{m.profile_blueprints()}</h2>
				{bpLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Skeleton className="h-48" />
						<Skeleton className="h-48" />
						<Skeleton className="h-48" />
					</div>
				) : blueprintsData?.items?.length ? (
					<BlueprintList blueprints={blueprintsData.items} />
				) : (
					<p className="text-sm text-on-surface-variant">{m.profile_no_blueprints()}</p>
				)}
			</div>
		</div>
	);
}
