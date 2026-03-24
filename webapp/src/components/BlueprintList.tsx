import { Link } from '@tanstack/react-router';
import { Blocks } from 'lucide-react';
import { cn } from '../lib/utils.js';
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
			className="group flex flex-col bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-rest hover:shadow-hover no-underline"
		>
			<div className="flex justify-between items-start mb-4">
				<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
					<Blocks className="h-5 w-5" />
				</div>
				{blueprint.score != null && (
					<Badge variant="tertiary">{Math.round(blueprint.score * 100)}% Match</Badge>
				)}
			</div>
			<h3 className="text-lg font-bold font-headline mb-2 text-on-surface group-hover:text-primary transition-colors">
				{blueprint.name}
			</h3>
			{blueprint.description && (
				<p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
					{blueprint.description}
				</p>
			)}
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant={stackVariant[blueprint.stack] ?? 'default'}>{blueprint.stack}</Badge>
				<Badge variant="default">{blueprint.layer}</Badge>
				{blueprint.projectName && (
					<Badge variant="tertiary" className={cn('normal-case tracking-normal font-medium')}>
						{blueprint.projectName}
					</Badge>
				)}
			</div>
			{blueprint.authorName && (
				<div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-auto pt-4">
					{blueprint.authorImage ? (
						<img src={blueprint.authorImage} alt="" className="h-5 w-5 rounded-full" />
					) : null}
					{blueprint.authorName}
				</div>
			)}
		</Link>
	);
}

function blueprintCountLabel(count: number): string {
	return count === 1 ? m.blueprint_count_one({ count }) : m.blueprint_count_other({ count });
}

export function BlueprintList({ blueprints }: { blueprints: Blueprint[] }) {
	return (
		<div className="space-y-6">
			<p className="text-sm text-on-surface-variant">{blueprintCountLabel(blueprints.length)}</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{blueprints.map((b) => (
					<BlueprintCard key={b.id} blueprint={b} />
				))}
			</div>
		</div>
	);
}
