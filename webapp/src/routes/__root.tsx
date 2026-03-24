import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Link, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { Moon, Plus, Sun } from 'lucide-react';
import { AuthButton } from '../components/AuthButton.js';
import { Button } from '../components/ui/button.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { authClient } from '../lib/auth-client.js';
import { ThemeProvider, useTheme } from '../lib/theme.js';
import { cn } from '../lib/utils.js';
import * as m from '../paraglide/messages.js';

const queryClient = new QueryClient();

function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	return (
		<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
			{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</Button>
	);
}

const navLinkClass =
	'font-headline font-bold tracking-tight text-on-surface-variant no-underline hover:text-primary transition-colors pb-1 border-b-2 border-transparent';
const navLinkActiveClass = '[&.active]:text-primary [&.active]:border-primary';

function RootLayout() {
	const { data: session, isPending } = authClient.useSession();
	const isAdmin = session?.user?.role === 'admin';
	const location = useLocation();
	const isLoginPage = location.pathname === '/login';

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
		return <Navigate to="/login" />;
	}

	return (
		<div className="min-h-screen bg-surface text-on-surface">
			{!isLoginPage && (
				<header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-rest">
					<div className="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
						<div className="flex items-center gap-8">
							<Link
								to="/"
								className="text-2xl font-black text-primary tracking-tighter font-headline no-underline"
							>
								{m.app_title()}
							</Link>
							<nav className="hidden md:flex gap-6 items-center">
								<Link
									to="/"
									className={cn(navLinkClass, navLinkActiveClass)}
									activeOptions={{ exact: true }}
								>
									{m.nav_all()}
								</Link>
								<Link to="/projects" className={cn(navLinkClass, navLinkActiveClass)}>
									{m.nav_projects()}
								</Link>
								<Link to="/tags" className={cn(navLinkClass, navLinkActiveClass)}>
									{m.nav_tags()}
								</Link>
								{isAdmin && (
									<Link to="/admin" className={cn(navLinkClass, navLinkActiveClass)}>
										{m.nav_admin()}
									</Link>
								)}
							</nav>
						</div>
						<div className="flex items-center gap-3">
							<Link to="/blueprints/new" className="no-underline">
								<Button variant="primary" size="sm">
									<Plus className="h-4 w-4" />
									{m.nav_new_blueprint()}
								</Button>
							</Link>
							<ThemeToggle />
							<AuthButton />
						</div>
					</div>
				</header>
			)}
			<main className={isLoginPage ? '' : 'pt-24 pb-20 px-8 max-w-[1440px] mx-auto'}>
				<Outlet />
			</main>
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
