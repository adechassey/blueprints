import { createFileRoute, Link } from '@tanstack/react-router';
import { useTags } from '../hooks/useTags.js';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/tags')({
	component: TagsPage,
});

function TagsPage() {
	const { data: tags, isLoading } = useTags();

	return (
		<>
			<h1 className="mb-6 text-2xl font-bold text-gray-900">{m.tags_title()}</h1>
			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : tags?.length ? (
				<div className="flex flex-wrap gap-2">
					{tags.map((tag) => (
						<Link
							key={tag.id}
							to="/"
							search={{ tag: tag.name }}
							className="rounded-full border bg-white px-3 py-1.5 text-sm no-underline hover:bg-gray-50"
						>
							{tag.name}
							<span className="ml-1 text-gray-400">({tag.count})</span>
						</Link>
					))}
				</div>
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</>
	);
}
