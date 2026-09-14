import { Link } from '@tanstack/react-router';
import { Blocks, Download } from 'lucide-react';
import * as m from '../paraglide/messages.js';
import { Badge } from './ui/badge.js';

interface Blueprint {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	usage?: string | null;
	stack: string;
	layer: string;
	authorName?: string | null;
	authorImage?: string | null;
	downloadCount?: number;
	projectName?: string | null;
	score?: number | null;
	createdAt: string;
}

const stackVariant: Record<string, 'webapp' | 'server' | 'shared' | 'fullstack'> = {
	webapp: 'webapp',
	server: 'server',
	shared: 'shared',
	fullstack: 'fullstack',
};

function BlueprintCard({ blueprint }: { blueprint: Blueprint }) {
	return (
		<Link
			to="/blueprints/$blueprintId"
			params={{ blueprintId: blueprint.id }}
			className="group flex flex-col bg-surface-container-lowest border border-outline-variant/70 p-5 rounded-xl shadow-rest hover:border-outline hover:shadow-hover transition-all duration-200 hover:-translate-y-0.5 no-underline"
		>
			<div className="flex justify-between items-start mb-4">
				<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
					<Blocks className="h-4.5 w-4.5" />
				</div>
				{blueprint.score != null && (
					<Badge variant="primary">{Math.round(blueprint.score * 100)}% match</Badge>
				)}
			</div>
			<h3 className="text-base font-bold font-headline mb-1.5 text-on-surface group-hover:text-primary transition-colors">
				{blueprint.name}
			</h3>
			{blueprint.description && (
				<p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
					{blueprint.description}
				</p>
			)}
			<div className="flex flex-wrap items-center gap-1.5">
				<Badge variant={stackVariant[blueprint.stack] ?? 'default'}>{blueprint.stack}</Badge>
				<Badge variant="default">{blueprint.layer}</Badge>
				{blueprint.projectName && <Badge variant="tertiary">{blueprint.projectName}</Badge>}
			</div>
			<div className="flex items-center justify-between mt-auto pt-4 text-xs text-on-surface-variant">
				{blueprint.authorName ? (
					<span className="flex items-center gap-1.5 min-w-0">
						{blueprint.authorImage ? (
							<img src={blueprint.authorImage} alt="" className="h-5 w-5 rounded-full" />
						) : null}
						<span className="truncate">{blueprint.authorName}</span>
					</span>
				) : (
					<span />
				)}
				{!!blueprint.downloadCount && (
					<span className="flex items-center gap-1 shrink-0 text-outline">
						<Download className="h-3.5 w-3.5" />
						{blueprint.downloadCount}
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
		<div className="space-y-5">
			<p className="text-sm text-on-surface-variant">{blueprintCountLabel(blueprints.length)}</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{blueprints.map((b) => (
					<BlueprintCard key={b.id} blueprint={b} />
				))}
			</div>
		</div>
	);
}
