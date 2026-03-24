import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { AuthButton } from '../components/AuthButton.js';
import * as m from '../paraglide/messages.js';

const queryClient = new QueryClient();

export const Route = createRootRoute({
	component: () => (
		<QueryClientProvider client={queryClient}>
			<div className="min-h-screen bg-gray-50 text-gray-900">
				<header className="border-b border-gray-200 bg-white">
					<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
						<div className="flex items-center gap-6">
							<Link to="/" className="text-xl font-bold tracking-tight text-gray-900 no-underline">
								{m.app_title()}
							</Link>
							<nav className="flex gap-4 text-sm">
								<Link
									to="/"
									className="text-gray-500 no-underline hover:text-gray-900 [&.active]:font-medium [&.active]:text-gray-900"
								>
									{m.nav_all()}
								</Link>
								<Link
									to="/projects"
									className="text-gray-500 no-underline hover:text-gray-900 [&.active]:font-medium [&.active]:text-gray-900"
								>
									{m.nav_projects()}
								</Link>
								<Link
									to="/tags"
									className="text-gray-500 no-underline hover:text-gray-900 [&.active]:font-medium [&.active]:text-gray-900"
								>
									{m.nav_tags()}
								</Link>
							</nav>
						</div>
						<div className="flex items-center gap-4">
							<Link
								to="/blueprints/new"
								className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white no-underline hover:bg-blue-700"
							>
								{m.nav_new_blueprint()}
							</Link>
							<AuthButton />
						</div>
					</div>
				</header>
				<main className="mx-auto max-w-5xl px-6 py-8">
					<Outlet />
				</main>
			</div>
		</QueryClientProvider>
	),
});
