import { Navigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { authClient } from '../lib/auth-client.js';
import { Skeleton } from './ui/skeleton.js';

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	if (!session?.user) {
		return <Navigate to="/login" search={{}} />;
	}

	return <>{children}</>;
}
