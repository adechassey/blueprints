import { useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';
import { GoogleIcon } from './GoogleIcon.js';
import { Avatar } from './ui/avatar.js';
import { Button } from './ui/button.js';

export function AuthButton() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	if (isPending) return null;

	if (session?.user) {
		return (
			<div className="flex items-center gap-3">
				<Avatar
					src={session.user.image}
					fallback={session.user.name ?? ''}
					size="lg"
					className="hover:border-primary cursor-pointer"
				/>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => authClient.signOut()}
					aria-label={m.auth_sign_out()}
				>
					<LogOut className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	return (
		<Button variant="secondary" onClick={() => navigate({ to: '/login', search: {} })}>
			<GoogleIcon />
			{m.auth_sign_in_google()}
		</Button>
	);
}
