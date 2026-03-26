import { Link } from '@tanstack/react-router';
import { Check, RefreshCw, X } from 'lucide-react';
import { useBlueprintMatches, useComputeMatches, useUpdateMatch } from '../hooks/useMatches.js';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';
import { Badge } from './ui/badge.js';
import { Button } from './ui/button.js';
import { Skeleton } from './ui/skeleton.js';

interface MatchSectionProps {
	blueprintId: string;
}

export function MatchSection({ blueprintId }: MatchSectionProps) {
	const { data: session } = authClient.useSession();
	const { data: matches, isLoading } = useBlueprintMatches(blueprintId);
	const computeMutation = useComputeMatches(blueprintId);
	const updateMutation = useUpdateMatch(blueprintId);

	const canManage = !!session?.user;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-headline text-xl font-extrabold">{m.matches_title()}</h3>
				{canManage && (
					<Button
						variant="secondary"
						size="sm"
						onClick={() => computeMutation.mutate()}
						disabled={computeMutation.isPending}
					>
						<RefreshCw className={`h-4 w-4 ${computeMutation.isPending ? 'animate-spin' : ''}`} />
						{computeMutation.isPending ? m.matches_finding() : m.matches_find()}
					</Button>
				)}
			</div>

			{isLoading ? (
				<div className="space-y-2">
					<Skeleton className="h-14 w-full" />
					<Skeleton className="h-14 w-full" />
				</div>
			) : matches?.length ? (
				<div className="space-y-2">
					{matches.map((match) => (
						<div
							key={match.id}
							className="flex items-center justify-between rounded-xl bg-surface-container-lowest border border-outline-variant/15 p-4 transition-all hover:shadow-rest"
						>
							<div className="flex items-center gap-3 flex-wrap">
								<Link
									to="/blueprints/$blueprintId"
									params={{ blueprintId: match.matchedBlueprint.id }}
									className="text-sm font-semibold text-on-surface no-underline hover:text-primary transition-colors"
								>
									{match.matchedBlueprint.name}
								</Link>
								{match.reason === 'slug' ? (
									<Badge variant="shared">{m.matches_reason_slug()}</Badge>
								) : (
									<Badge variant="success">
										{m.matches_reason_embedding({ score: match.score ?? 0 })}
									</Badge>
								)}
								<Badge variant={match.status === 'confirmed' ? 'success' : 'default'}>
									{match.status === 'confirmed'
										? m.matches_status_confirmed()
										: m.matches_status_possible()}
								</Badge>
							</div>
							{canManage && match.status === 'possible' && (
								<div className="flex gap-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
										onClick={() =>
											updateMutation.mutate({
												matchId: match.id,
												status: 'confirmed',
											})
										}
									>
										<Check className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() =>
											updateMutation.mutate({
												matchId: match.id,
												status: 'dismissed',
											})
										}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-on-surface-variant">{m.matches_empty()}</p>
			)}
		</div>
	);
}
