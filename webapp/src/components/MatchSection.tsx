import { Link } from '@tanstack/react-router';
import { useBlueprintMatches, useComputeMatches, useUpdateMatch } from '../hooks/useMatches.js';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';

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
				<h2 className="text-lg font-semibold">{m.matches_title()}</h2>
				{canManage && (
					<button
						type="button"
						onClick={() => computeMutation.mutate()}
						disabled={computeMutation.isPending}
						className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
					>
						{computeMutation.isPending ? m.matches_finding() : m.matches_find()}
					</button>
				)}
			</div>

			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : matches?.length ? (
				<div className="space-y-2">
					{matches.map((match) => (
						<div
							key={match.id}
							className="flex items-center justify-between rounded-lg border bg-white p-3"
						>
							<div className="flex items-center gap-3">
								<Link
									to="/blueprints/$blueprintId"
									params={{ blueprintId: match.matchedBlueprint.id }}
									className="text-sm font-medium text-gray-900 no-underline hover:underline"
								>
									{match.matchedBlueprint.name}
								</Link>
								{match.reason === 'slug' ? (
									<span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-600">
										{m.matches_reason_slug()}
									</span>
								) : (
									<span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-600">
										{m.matches_reason_embedding({ score: match.score ?? 0 })}
									</span>
								)}
								<span
									className={`rounded px-1.5 py-0.5 text-xs ${
										match.status === 'confirmed'
											? 'bg-green-50 text-green-600'
											: 'bg-yellow-50 text-yellow-600'
									}`}
								>
									{match.status === 'confirmed'
										? m.matches_status_confirmed()
										: m.matches_status_possible()}
								</span>
								{match.matchedBlueprint.projectName && (
									<span className="text-xs text-gray-400">
										{match.matchedBlueprint.projectName}
									</span>
								)}
							</div>
							{canManage && match.status === 'possible' && (
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() =>
											updateMutation.mutate({ matchId: match.id, status: 'confirmed' })
										}
										className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
									>
										{m.matches_confirm()}
									</button>
									<button
										type="button"
										onClick={() =>
											updateMutation.mutate({ matchId: match.id, status: 'dismissed' })
										}
										className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
									>
										{m.matches_dismiss()}
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-500">{m.matches_empty()}</p>
			)}
		</div>
	);
}
