import { createFileRoute } from '@tanstack/react-router';
import { GoogleIcon } from '../components/GoogleIcon.js';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/login')({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="flex flex-col items-center justify-center py-20">
			<h1 className="mb-4 text-2xl font-bold">{m.auth_login_title()}</h1>
			<p className="mb-8 text-sm text-gray-500">{m.auth_login_subtitle()}</p>
			<button
				type="button"
				onClick={() =>
					authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin })
				}
				className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
			>
				<GoogleIcon />
				{m.auth_sign_in_google()}
			</button>
		</div>
	);
}
