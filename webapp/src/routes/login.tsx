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
		<div className="flex min-h-screen items-center justify-center bg-surface px-4">
			<Card className="max-w-md w-full">
				<CardContent className="flex flex-col items-center gap-6 py-12">
					<span className="text-3xl font-black text-primary tracking-tighter font-headline">
						Blueprints
					</span>
					<div className="text-center space-y-2">
						<h1 className="text-2xl font-bold font-headline">{m.auth_login_title()}</h1>
						<p className="text-sm text-on-surface-variant">{m.auth_login_subtitle()}</p>
					</div>
					<Button variant="secondary" size="lg" onClick={handleSignIn} className="w-full max-w-xs">
						<GoogleIcon />
						{m.auth_sign_in_google()}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
