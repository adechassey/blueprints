import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button.js';
import { Card, CardContent } from '../components/ui/card.js';
import { authClient } from '../lib/auth-client.js';
import { API_URL } from '../lib/config.js';

export const Route = createFileRoute('/cli-token')({
	component: CliTokenPage,
});

function CliTokenPage() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const [token, setToken] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!isPending && !session) {
			navigate({ to: '/login', search: { returnTo: '/cli-token' } });
		}
	}, [session, isPending, navigate]);

	useEffect(() => {
		if (!session) return;
		fetch(`${API_URL}/api/users/me/token`, { credentials: 'include' })
			.then((res) => res.json())
			.then((data) => setToken(data.token))
			.catch(() => setToken(null));
	}, [session]);

	const handleCopy = async () => {
		if (!token) return;
		const command = `theodo-blueprints auth login --token ${token}`;
		await navigator.clipboard.writeText(command);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (isPending) {
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
					<h1 className="font-semibold text-xl">CLI Authentication</h1>
					<p className="text-on-surface-variant text-sm">
						Copy the command below and paste it in your terminal to authenticate the CLI.
					</p>
					{token ? (
						<>
							<pre className="overflow-x-auto rounded-md bg-surface-variant p-3 text-sm">
								theodo-blueprints auth login --token {token}
							</pre>
							<Button onClick={handleCopy} className="w-full">
								{copied ? 'Copied!' : 'Copy command'}
							</Button>
						</>
					) : (
						<p className="text-on-surface-variant text-sm">Generating token...</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
