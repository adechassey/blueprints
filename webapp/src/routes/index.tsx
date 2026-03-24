import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlueprintList } from '../components/BlueprintList.js';
import { FilterBar } from '../components/FilterBar.js';
import { Pagination } from '../components/Pagination.js';
import { SearchBar } from '../components/SearchBar.js';
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
		<>
			<h1 className="mb-6 text-2xl font-bold text-gray-900">
				{isSearchMode ? m.search_results_title({ query: q }) : m.page_all_title()}
			</h1>
			<div className="mb-4">
				<SearchBar initialQuery={q || ''} onSearch={handleSearch} isLoading={isLoading} />
			</div>
			<div className="mb-6">
				<FilterBar stack={stack} layer={layer} tag={tag} onFilterChange={handleFilterChange} />
			</div>
			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : data?.items?.length ? (
				<>
					<BlueprintList blueprints={data.items} />
					{paginationData && 'page' in paginationData && 'limit' in paginationData && (
						<div className="mt-6">
							<Pagination
								page={paginationData.page}
								total={paginationData.total}
								limit={paginationData.limit}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</>
			) : isSearchMode ? (
				<p className="text-sm text-gray-500">{m.search_no_results({ query: q })}</p>
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</>
	);
}
