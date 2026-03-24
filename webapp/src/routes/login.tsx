import { createFileRoute } from '@tanstack/react-router';
import { GoogleIcon } from '../components/GoogleIcon.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/login')({
	component: LoginPage,
});

function LoginPage() {
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
					<Button
						variant="secondary"
						size="lg"
						onClick={() =>
							authClient.signIn.social({
								provider: 'google',
								callbackURL: window.location.origin,
							})
						}
						className="w-full max-w-xs"
					>
						<GoogleIcon />
						{m.auth_sign_in_google()}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
