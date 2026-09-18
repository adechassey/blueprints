import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { GoogleIcon } from '../components/GoogleIcon.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';
import { authClient } from '../lib/auth-client.js';
import { PRODUCTION_URL } from '../lib/config.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/login')({
	validateSearch: (search: Record<string, unknown>): { returnTo?: string } => ({
		returnTo: typeof search.returnTo === 'string' ? search.returnTo : undefined,
	}),
	component: LoginPage,
});

/** Placeholder the search hint is split on, so the shortcut renders as a key cap. */
const SHORTCUT_SLOT = '\u0000';

/**
 * Returns true if running on a Vercel preview deployment (not production, not local dev).
 */
function isPreviewDeployment(): boolean {
	return !!PRODUCTION_URL && window.location.origin !== PRODUCTION_URL;
}

function LoginPage() {
	const { returnTo } = Route.useSearch();

	// On preview: redirect to production login with returnTo pointing back here
	useEffect(() => {
		if (isPreviewDeployment() && !returnTo) {
			window.location.href = `${PRODUCTION_URL}/login?returnTo=${encodeURIComponent(window.location.origin)}`;
		}
	}, [returnTo]);

	const [hintBefore, hintAfter] = m
		.auth_login_search_hint({ shortcut: SHORTCUT_SLOT })
		.split(SHORTCUT_SLOT);

	const handleSignIn = () => {
		// If returnTo is present, route OAuth callback through the transfer endpoint
		const callbackURL = returnTo
			? `${window.location.origin}/api/auth-transfer?returnTo=${encodeURIComponent(returnTo)}`
			: window.location.origin;

		authClient.signIn.social({
			provider: 'google',
			callbackURL,
		});
	};

	// Show loading state while redirecting from preview to production
	if (isPreviewDeployment() && !returnTo) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-surface px-4">
				<p className="text-on-surface-variant">Redirecting...</p>
			</div>
		);
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4">
			<div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
			<div
				className="pointer-events-none absolute top-0 left-1/2 h-96 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
				aria-hidden="true"
			/>
			<Card className="relative max-w-md w-full shadow-hover">
				<CardContent className="flex flex-col items-center gap-8 py-12">
					<h1 className="flex items-center gap-3 text-2xl font-extrabold text-on-surface tracking-tight font-headline">
						<img src="/logo.svg" alt="" className="h-11 w-11 rounded-xl shadow-xs" />
						{m.app_title()}
					</h1>
					{/* What a visitor gets, before being asked for anything */}
					<p className="max-w-sm text-center text-base leading-relaxed text-on-surface-variant">
						{m.auth_login_tagline()}
					</p>
					<Button variant="secondary" size="lg" onClick={handleSignIn} className="w-full max-w-xs">
						<GoogleIcon />
						{m.auth_sign_in_google()}
					</Button>
					<p className="text-center text-xs text-outline">{m.auth_login_access()}</p>
					{/* The palette works before sign-in, so this is a real teaser. One sentence for
					    translators, split around the key cap at render time. */}
					<p className="text-center text-xs text-outline">
						{hintBefore}
						<kbd className="rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 font-mono">
							⌘K
						</kbd>
						{hintAfter}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
