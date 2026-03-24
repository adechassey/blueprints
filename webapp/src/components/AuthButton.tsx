import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';

export function AuthButton() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) return null;

	if (session?.user) {
		return (
			<div className="flex items-center gap-3">
				<span className="text-sm text-gray-600">{session.user.name}</span>
				<button
					type="button"
					onClick={() => authClient.signOut()}
					className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
				>
					{m.auth_sign_out()}
				</button>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => authClient.signIn.social({ provider: 'google' })}
			className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
		>
			{m.auth_sign_in_google()}
		</button>
	);
}
