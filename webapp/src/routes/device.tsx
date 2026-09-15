import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';
import { authClient } from '../lib/auth-client.js';
import { API_URL } from '../lib/config.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/device')({
	validateSearch: (search: Record<string, unknown>): { user_code?: string } => ({
		user_code: typeof search.user_code === 'string' ? search.user_code : undefined,
	}),
	component: DevicePage,
});

function DevicePage() {
	const navigate = useNavigate();
	const { user_code: initialCode } = Route.useSearch();
	const { data: session, isPending } = authClient.useSession();
	const [code, setCode] = useState(initialCode ?? '');
	const [status, setStatus] = useState<'idle' | 'approving' | 'approved' | 'error'>('idle');

	useEffect(() => {
		if (!isPending && !session) {
			navigate({
				to: '/login',
				search: {
					returnTo: initialCode
						? `/device?user_code=${encodeURIComponent(initialCode)}`
						: '/device',
				},
			});
		}
	}, [session, isPending, navigate, initialCode]);

	const handleApprove = async () => {
		setStatus('approving');
		const res = await fetch(`${API_URL}/api/auth/device/approve`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ user_code: code.trim().toUpperCase() }),
		});
		setStatus(res.ok ? 'approved' : 'error');
	};

	if (isPending || !session) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-on-surface-variant">Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardContent className="space-y-4 pt-6">
					<h1 className="font-semibold text-xl">{m.device_title()}</h1>
					{status === 'approved' ? (
						<p className="text-sm text-on-surface">{m.device_approved()}</p>
					) : (
						<>
							<p className="text-on-surface-variant text-sm">{m.device_description()}</p>
							<div className="space-y-2">
								<span className="text-sm font-medium">{m.device_code_label()}</span>
								<Input
									id="device-code"
									value={code}
									onChange={(e) => setCode(e.target.value.toUpperCase())}
									placeholder={m.device_code_placeholder()}
									className="font-mono tracking-widest"
									maxLength={9}
								/>
							</div>
							{status === 'error' && <p className="text-sm text-red-600">{m.device_error()}</p>}
							<Button
								onClick={handleApprove}
								disabled={status === 'approving' || code.length < 9}
								className="w-full"
							>
								{status === 'approving' ? m.device_approving() : m.device_approve()}
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
