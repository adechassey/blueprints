import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import * as m from '../paraglide/messages.js';

export const Route = createRootRoute({
	component: () => (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<header className="border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
					<Link to="/" className="text-xl font-bold tracking-tight text-gray-900 no-underline">
						{m.app_title()}
					</Link>
					<nav className="flex gap-4 text-sm">
						<Link
							to="/"
							className="text-gray-500 hover:text-gray-900 no-underline [&.active]:text-gray-900 [&.active]:font-medium"
						>
							{m.nav_all()}
						</Link>
						<Link
							to="/stack/$stack"
							params={{ stack: 'webapp' }}
							className="text-gray-500 hover:text-gray-900 no-underline [&.active]:text-gray-900 [&.active]:font-medium"
						>
							{m.nav_webapp()}
						</Link>
						<Link
							to="/stack/$stack"
							params={{ stack: 'server' }}
							className="text-gray-500 hover:text-gray-900 no-underline [&.active]:text-gray-900 [&.active]:font-medium"
						>
							{m.nav_server()}
						</Link>
						<Link
							to="/stack/$stack"
							params={{ stack: 'shared' }}
							className="text-gray-500 hover:text-gray-900 no-underline [&.active]:text-gray-900 [&.active]:font-medium"
						>
							{m.nav_shared()}
						</Link>
					</nav>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-6 py-8">
				<Outlet />
			</main>
		</div>
	),
});
