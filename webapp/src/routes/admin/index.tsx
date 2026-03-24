import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { useAdminStats } from '../../hooks/useAdmin.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/')({
	component: AdminDashboard,
});

function AdminDashboard() {
	const { data: stats, isLoading } = useAdminStats();

	return (
		<ProtectedRoute>
			<h1 className="mb-6 text-2xl font-bold">{m.admin_dashboard()}</h1>

			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : stats ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard label={m.admin_stat_users()} value={stats.users} />
					<StatCard label={m.admin_stat_blueprints()} value={stats.blueprints} />
					<StatCard label={m.admin_stat_comments()} value={stats.comments} />
					<StatCard label={m.admin_stat_projects()} value={stats.projects} />
				</div>
			) : null}

			<nav className="mt-8 space-y-2">
				<Link
					to="/admin/users"
					className="block rounded border bg-white p-4 no-underline hover:shadow-sm"
				>
					{m.admin_manage_users()}
				</Link>
				<Link
					to="/admin/blueprints"
					className="block rounded border bg-white p-4 no-underline hover:shadow-sm"
				>
					{m.admin_manage_blueprints()}
				</Link>
				<Link
					to="/admin/comments"
					className="block rounded border bg-white p-4 no-underline hover:shadow-sm"
				>
					{m.admin_manage_comments()}
				</Link>
				<Link
					to="/admin/projects"
					className="block rounded border bg-white p-4 no-underline hover:shadow-sm"
				>
					{m.admin_manage_projects()}
				</Link>
			</nav>
		</ProtectedRoute>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border bg-white p-4 text-center">
			<p className="text-3xl font-bold text-gray-900">{value}</p>
			<p className="mt-1 text-sm text-gray-500">{label}</p>
		</div>
	);
}
