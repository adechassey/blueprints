import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlueprintList } from '../components/BlueprintList.js';
import { FilterBar } from '../components/FilterBar.js';
import { Pagination } from '../components/Pagination.js';
import { SearchBar } from '../components/SearchBar.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { useBlueprints } from '../hooks/useBlueprints.js';
import { useSearch } from '../hooks/useSearch.js';
import * as m from '../paraglide/messages.js';

interface SearchParams {
	page?: number;
	stack?: string;
	layer?: string;
	tag?: string;
	q?: string;
}

export const Route = createFileRoute('/')({
	validateSearch: (search: Record<string, unknown>): SearchParams => ({
		page: Number(search.page) || undefined,
		stack: (search.stack as string) || undefined,
		layer: (search.layer as string) || undefined,
		tag: (search.tag as string) || undefined,
		q: (search.q as string) || undefined,
	}),
	component: IndexPage,
});

function IndexPage() {
	const { page = 1, stack, layer, tag, q } = Route.useSearch();
	const navigate = useNavigate();

	const browseQuery = useBlueprints({ page, stack, layer, tag });
	const searchQuery = useSearch(q || '', { stack, layer, tag });

	const isSearchMode = !!q;
	const data = isSearchMode ? searchQuery.data : browseQuery.data;
	const isLoading = isSearchMode ? searchQuery.isLoading : browseQuery.isLoading;

	const handleSearch = (query: string) => {
		navigate({
			to: '/',
			search: (prev: SearchParams) => ({
				...prev,
				q: query || undefined,
				page: undefined,
			}),
		});
	};

	const handleFilterChange = (key: string, value: string | undefined) => {
		navigate({
			to: '/',
			search: (prev: SearchParams) => ({
				...prev,
				[key]: value,
				page: undefined,
			}),
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: '/',
			search: (prev: SearchParams) => ({ ...prev, page: newPage }),
		});
	};

	const paginationData = !isSearchMode ? browseQuery.data : undefined;

	return (
		<div className="space-y-8">
			<header>
				<div className="max-w-4xl">
					<h1 className="text-5xl font-extrabold tracking-tight font-headline text-on-surface mb-8">
						{isSearchMode ? (
							<>
								Search results for <span className="text-primary italic">&ldquo;{q}&rdquo;</span>
							</>
						) : (
							m.page_all_title()
						)}
					</h1>
				</div>
				<SearchBar initialQuery={q || ''} onSearch={handleSearch} isLoading={isLoading} />
			</header>

			<FilterBar
				stack={stack}
				layer={layer}
				tag={tag}
				onFilterChange={handleFilterChange}
				total={data?.items?.length}
			/>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{Array.from({ length: 8 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no stable id
						<Skeleton key={i} className="h-48" />
					))}
				</div>
			) : data?.items?.length ? (
				<>
					<BlueprintList blueprints={data.items} />
					{paginationData && 'page' in paginationData && 'limit' in paginationData && (
						<Pagination
							page={paginationData.page}
							total={paginationData.total}
							limit={paginationData.limit}
							onPageChange={handlePageChange}
						/>
					)}
				</>
			) : isSearchMode ? (
				<p className="text-sm text-on-surface-variant">{m.search_no_results({ query: q })}</p>
			) : (
				<p className="text-sm text-on-surface-variant">{m.empty_state()}</p>
			)}
		</div>
	);
}
