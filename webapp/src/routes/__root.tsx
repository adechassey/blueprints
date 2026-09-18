import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Link, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { Menu, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { AuthButton } from '../components/AuthButton.js';
import { CommandPalette } from '../components/CommandPalette.js';
import { Button } from '../components/ui/button.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { Toaster } from '../components/ui/sonner.js';
import { authClient } from '../lib/auth-client.js';
import { ThemeProvider, useTheme } from '../lib/theme.js';
import * as m from '../paraglide/messages.js';

const queryClient = new QueryClient();

const navLinkClass =
	'rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant no-underline transition-colors hover:bg-surface-container-high hover:text-on-surface [&.active]:bg-surface-container-high [&.active]:text-on-surface';

function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	return (
		<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
			{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</Button>
	);
}

function RootLayout() {
	const { data: session, isPending } = authClient.useSession();
	const isAdmin = session?.user?.role === 'admin';
	const location = useLocation();
	const isLoginPage = location.pathname === '/login';
	const [mobileOpen, setMobileOpen] = useState(false);
	const closeMobile = () => setMobileOpen(false);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-surface">
				<div className="space-y-4 text-center">
					<Skeleton className="h-8 w-48 mx-auto" />
					<Skeleton className="h-4 w-32 mx-auto" />
				</div>
			</div>
		);
	}

	if (!session?.user && !isLoginPage) {
		return <Navigate to="/login" search={{}} />;
	}

	return (
		<div className="min-h-screen bg-surface text-on-surface">
			{!isLoginPage && (
				<header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/50">
					<div className="flex justify-between items-center w-full px-6 py-3 max-w-6xl mx-auto">
						<div className="flex items-center gap-6">
							<Link
								to="/"
								aria-label={m.app_title()}
								className="flex items-center gap-2 text-lg font-extrabold whitespace-nowrap text-on-surface tracking-tight font-headline no-underline"
							>
								<img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg shadow-xs" />
								{/* The wordmark collides with the icon buttons on phones */}
								<span className="hidden sm:inline">{m.app_title()}</span>
							</Link>
							<nav className="hidden xl:flex gap-1 items-center">
								<Link to="/" className={navLinkClass} activeOptions={{ exact: true }}>
									{m.nav_all()}
								</Link>
								<Link to="/stacks" className={navLinkClass}>
									{m.nav_stacks()}
								</Link>
								<Link to="/technologies" className={navLinkClass}>
									{m.nav_technologies()}
								</Link>
								<Link to="/projects" className={navLinkClass}>
									{m.nav_projects()}
								</Link>
								<Link to="/tags" className={navLinkClass}>
									{m.nav_tags()}
								</Link>
								<Link to="/cli" className={navLinkClass}>
									{m.nav_cli()}
								</Link>
								{isAdmin && (
									<Link to="/admin" className={navLinkClass}>
										{m.nav_admin()}
									</Link>
								)}
							</nav>
						</div>
						<div className="flex items-center gap-1.5">
							<Button
								variant="ghost"
								size="icon"
								aria-label="Search"
								onClick={() => document.dispatchEvent(new CustomEvent('blueprints:open-search'))}
							>
								<Search className="h-4 w-4" />
							</Button>
							<Link to="/blueprints/new" className="no-underline hidden sm:block">
								<Button variant="primary" size="sm">
									<Plus className="h-4 w-4" />
									{m.nav_new_blueprint()}
								</Button>
							</Link>
							<ThemeToggle />
							<AuthButton />
							<Button
								variant="ghost"
								size="icon"
								className="xl:hidden"
								aria-label="Menu"
								onClick={() => setMobileOpen((prev) => !prev)}
							>
								{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
							</Button>
						</div>
					</div>
					{mobileOpen && (
						<nav className="flex flex-col gap-1 border-t border-outline-variant/50 px-4 py-3 xl:hidden">
							<Link
								to="/"
								onClick={closeMobile}
								activeOptions={{ exact: true }}
								className={navLinkClass}
							>
								{m.nav_all()}
							</Link>
							<Link to="/stacks" onClick={closeMobile} className={navLinkClass}>
								{m.nav_stacks()}
							</Link>
							<Link to="/technologies" onClick={closeMobile} className={navLinkClass}>
								{m.nav_technologies()}
							</Link>
							<Link to="/projects" onClick={closeMobile} className={navLinkClass}>
								{m.nav_projects()}
							</Link>
							<Link to="/tags" onClick={closeMobile} className={navLinkClass}>
								{m.nav_tags()}
							</Link>
							<Link to="/cli" onClick={closeMobile} className={navLinkClass}>
								{m.nav_cli()}
							</Link>
							{isAdmin && (
								<Link to="/admin" onClick={closeMobile} className={navLinkClass}>
									{m.nav_admin()}
								</Link>
							)}
						</nav>
					)}
				</header>
			)}
			<main className={isLoginPage ? '' : 'pt-20 pb-20 px-6 max-w-6xl mx-auto'}>
				<Outlet />
			</main>
			<CommandPalette />
			<Toaster />
		</div>
	);
}

function RootWithProviders() {
	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<RootLayout />
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export const Route = createRootRoute({
	component: RootWithProviders,
});
