import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';
import { GoogleIcon } from './GoogleIcon.js';

export function AuthButton() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) return null;

	if (session?.user) {
		return (
			<div className="flex items-center gap-3">
				{session.user.image ? (
					<img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />
				) : (
					<div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
						{session.user.name?.charAt(0)?.toUpperCase()}
					</div>
				)}
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
			onClick={() =>
				authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin })
			}
			className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
		>
			<GoogleIcon />
			{m.auth_sign_in_google()}
		</button>
	);
}
