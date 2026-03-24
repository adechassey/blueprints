import { Link } from '@tanstack/react-router';
import * as m from '../paraglide/messages.js';

interface Blueprint {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	usage?: string | null;
	stack: string;
	layer: string;
	authorName?: string | null;
	downloadCount?: number;
	score?: number | null;
	createdAt: string;
}

const stackColors: Record<string, string> = {
	webapp: 'bg-blue-100 text-blue-700',
	server: 'bg-green-100 text-green-700',
	shared: 'bg-amber-100 text-amber-700',
	fullstack: 'bg-purple-100 text-purple-700',
};

function BlueprintCard({ blueprint }: { blueprint: Blueprint }) {
	return (
		<Link
			to="/blueprints/$blueprintId"
			params={{ blueprintId: blueprint.id }}
			className="block rounded-lg border border-gray-200 bg-white p-4 no-underline transition-shadow hover:shadow-sm"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-medium text-gray-900">{blueprint.name}</h3>
					{blueprint.score != null && (
						<span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
							{Math.round(blueprint.score * 100)}%
						</span>
					)}
				</div>
				<span
					className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${stackColors[blueprint.stack] ?? 'bg-gray-100 text-gray-600'}`}
				>
					{blueprint.stack}
				</span>
			</div>
			{blueprint.description && (
				<p className="mt-1 text-xs text-gray-500">{blueprint.description}</p>
			)}
			<div className="mt-2 flex items-center gap-2">
				<span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
					{blueprint.layer}
				</span>
				{blueprint.authorName && (
					<span className="text-xs text-gray-400">{blueprint.authorName}</span>
				)}
				{blueprint.downloadCount !== undefined && blueprint.downloadCount > 0 && (
					<span className="text-xs text-gray-400">
						{m.blueprint_detail_downloads({ count: blueprint.downloadCount })}
					</span>
				)}
			</div>
		</Link>
	);
}

function blueprintCountLabel(count: number): string {
	return count === 1 ? m.blueprint_count_one({ count }) : m.blueprint_count_other({ count });
}

export function BlueprintList({ blueprints }: { blueprints: Blueprint[] }) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-gray-500">{blueprintCountLabel(blueprints.length)}</p>
			<div className="grid gap-3 sm:grid-cols-2">
				{blueprints.map((b) => (
					<BlueprintCard key={b.id} blueprint={b} />
				))}
			</div>
		</div>
	);
}
