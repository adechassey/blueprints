import { createFileRoute } from '@tanstack/react-router';
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
				onClick={() => authClient.signIn.social({ provider: 'google' })}
				className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
			>
				{m.auth_sign_in_google()}
			</button>
		</div>
	);
}
