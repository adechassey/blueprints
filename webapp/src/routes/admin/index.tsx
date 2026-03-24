import { createFileRoute, Link } from '@tanstack/react-router';
import { Blocks, ChevronRight, FolderOpen, MessageSquare, Users } from 'lucide-react';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { Card, CardContent } from '../../components/ui/card.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import { useAdminStats } from '../../hooks/useAdmin.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/')({
	component: AdminDashboard,
});

const statIcons = [Users, Blocks, MessageSquare, FolderOpen];
const statColors = [
	'bg-primary/10 text-primary',
	'bg-tertiary/10 text-tertiary',
	'bg-secondary/10 text-secondary',
	'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
];

function AdminDashboard() {
	const { data: stats, isLoading } = useAdminStats();

	const statItems = stats
		? [
				{ label: m.admin_stat_users(), value: stats.users },
				{ label: m.admin_stat_blueprints(), value: stats.blueprints },
				{ label: m.admin_stat_comments(), value: stats.comments },
				{ label: m.admin_stat_projects(), value: stats.projects },
			]
		: [];

	const navItems = [
		{ to: '/admin/users' as const, label: m.admin_manage_users(), icon: Users },
		{ to: '/admin/blueprints' as const, label: m.admin_manage_blueprints(), icon: Blocks },
		{ to: '/admin/comments' as const, label: m.admin_manage_comments(), icon: MessageSquare },
		{ to: '/admin/projects' as const, label: m.admin_manage_projects(), icon: FolderOpen },
	];

	return (
		<ProtectedRoute>
			<div className="space-y-8">
				<h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
					{m.admin_dashboard()}
				</h1>

				{isLoading ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
							<Skeleton key={i} className="h-28" />
						))}
					</div>
				) : stats ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{statItems.map((stat, i) => {
							const Icon = statIcons[i] ?? Users;
							const color = statColors[i] ?? '';
							return (
								<Card key={stat.label}>
									<CardContent className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
										>
											<Icon className="h-6 w-6" />
										</div>
										<div>
											<p className="text-3xl font-black font-headline text-on-surface">
												{stat.value}
											</p>
											<p className="text-sm text-on-surface-variant">{stat.label}</p>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				) : null}

				<nav className="space-y-2">
					{navItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/15 no-underline hover:bg-surface-bright hover:shadow-rest transition-all group"
						>
							<div className="flex items-center gap-3">
								<item.icon className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
								<span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
									{item.label}
								</span>
							</div>
							<ChevronRight className="h-5 w-5 text-outline group-hover:text-primary transition-colors" />
						</Link>
					))}
				</nav>
			</div>
		</ProtectedRoute>
	);
}
