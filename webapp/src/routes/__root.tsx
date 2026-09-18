import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Link, Navigate, Outlet, useLocation } from '@tanstack/react-router';
import { ChevronDown, Menu, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { AuthButton } from '../components/AuthButton.js';
import { CommandPalette } from '../components/CommandPalette.js';
import { Button } from '../components/ui/button.js';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../components/ui/dropdown-menu.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { Toaster } from '../components/ui/sonner.js';
import { authClient } from '../lib/auth-client.js';
import { ThemeProvider, useTheme } from '../lib/theme.js';
import * as m from '../paraglide/messages.js';

const queryClient = new QueryClient();

const navLinkClass =
	'rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant no-underline transition-colors hover:bg-surface-container-high hover:text-on-surface [&.active]:bg-surface-container-high [&.active]:text-on-surface';

/**
 * The nav groups everything but the catalogue into two menus, so the bar stays
 * short enough to show from `lg` up instead of collapsing to the burger below
 * `xl`. `to` is a literal union the router checks, hence the shared type.
 */
type NavTo = '/stacks' | '/technologies' | '/projects' | '/tags' | '/cli' | '/skill';
type NavGroup = { label: () => string; items: { to: NavTo; label: () => string }[] };

const NAV_GROUPS: NavGroup[] = [
	{
		label: m.nav_browse,
		items: [
			{ to: '/stacks', label: m.nav_stacks },
			{ to: '/technologies', label: m.nav_technologies },
			{ to: '/projects', label: m.nav_projects },
			{ to: '/tags', label: m.nav_tags },
		],
	},
	{
		label: m.nav_docs,
		items: [
			{ to: '/cli', label: m.nav_cli },
			{ to: '/skill', label: m.nav_skill },
		],
	},
];

/** A nav menu whose trigger reads as active while one of its pages is open. */
function NavGroupMenu({ group, pathname }: { group: NavGroup; pathname: string }) {
	const isActive = group.items.some((item) => pathname.startsWith(item.to));
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={`${navLinkClass} flex items-center gap-1 ${
					isActive ? 'bg-surface-container-high text-on-surface' : ''
				}`}
			>
				{group.label()}
				<ChevronDown className="h-3.5 w-3.5" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{group.items.map((item) => (
					<DropdownMenuItem key={item.to} asChild>
						<Link to={item.to} className="no-underline text-on-surface">
							{item.label()}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

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
							<nav className="hidden lg:flex gap-1 items-center">
								<Link to="/" className={navLinkClass} activeOptions={{ exact: true }}>
									{m.nav_all()}
								</Link>
								{NAV_GROUPS.map((group) => (
									<NavGroupMenu key={group.label()} group={group} pathname={location.pathname} />
								))}
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
								className="lg:hidden"
								aria-label="Menu"
								onClick={() => setMobileOpen((prev) => !prev)}
							>
								{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
							</Button>
						</div>
					</div>
					{mobileOpen && (
						<nav className="flex flex-col gap-1 border-t border-outline-variant/50 px-4 py-3 lg:hidden">
							<Link
								to="/"
								onClick={closeMobile}
								activeOptions={{ exact: true }}
								className={navLinkClass}
							>
								{m.nav_all()}
							</Link>
							{/* Flat on mobile: the sheet has the room the top bar lacks. */}
							{NAV_GROUPS.map((group) => (
								<div key={group.label()} className="flex flex-col gap-1">
									<span className="px-3 pt-2 font-medium text-on-surface-variant text-xs uppercase tracking-wide">
										{group.label()}
									</span>
									{group.items.map((item) => (
										<Link key={item.to} to={item.to} onClick={closeMobile} className={navLinkClass}>
											{item.label()}
										</Link>
									))}
								</div>
							))}
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
