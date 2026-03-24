import { Navigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <p className="text-sm text-gray-500">{m.loading()}</p>;
	}

	if (!session?.user) {
		return <Navigate to="/login" />;
	}

	return <>{children}</>;
}
