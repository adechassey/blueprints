import { createFileRoute, Link } from '@tanstack/react-router';
import { Tag } from 'lucide-react';
import { Badge } from '../components/ui/badge.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { useTags } from '../hooks/useTags.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/tags')({
	component: TagsPage,
});

function TagsPage() {
	const { data: tags, isLoading } = useTags();

	return (
		<div className="space-y-8">
			<h1 className="text-5xl font-extrabold tracking-tight font-headline text-on-surface">
				{m.tags_title()}
			</h1>
			{isLoading ? (
				<div className="flex flex-wrap gap-3">
					{Array.from({ length: 12 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
						<Skeleton key={i} className="h-10 w-24 rounded-full" />
					))}
				</div>
			) : tags?.length ? (
				<div className="flex flex-wrap gap-3">
					{tags.map((tag) => (
						<Link key={tag.id} to="/" search={{ tag: tag.name }} className="no-underline group">
							<Badge
								variant="default"
								className="py-2.5 px-5 text-sm normal-case tracking-normal font-semibold cursor-pointer group-hover:bg-primary/10 group-hover:text-primary transition-colors"
							>
								<Tag className="h-3.5 w-3.5 mr-1.5" />
								{tag.name}
								<span className="ml-2 text-outline">{tag.count}</span>
							</Badge>
						</Link>
					))}
				</div>
			) : (
				<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
			)}
		</div>
	);
}
