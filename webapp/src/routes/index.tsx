import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Blocks, Plus, SearchX } from 'lucide-react';
import { BlueprintList } from '../components/BlueprintList.js';
import { FilterBar } from '../components/FilterBar.js';
import { OnboardingChecklist, WelcomeBanner } from '../components/Onboarding.js';
import { Pagination } from '../components/Pagination.js';
import { SearchBar } from '../components/SearchBar.js';
import { Button } from '../components/ui/button.js';
import { EmptyState } from '../components/ui/empty.js';
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
	const hasFilters = !!(stack || layer || tag);

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

	const clearAll = () => navigate({ to: '/', search: {} });

	const paginationData = !isSearchMode ? browseQuery.data : undefined;

	return (
		<div className="space-y-8">
			<header className="space-y-6">
				<div>
					<h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
						{isSearchMode ? (
							<>
								{m.search_results_title()}{' '}
								<span className="text-primary italic">&ldquo;{q}&rdquo;</span>
							</>
						) : (
							m.page_all_title()
						)}
					</h1>
				</div>
				<SearchBar initialQuery={q || ''} onSearch={handleSearch} isLoading={isLoading} />
			</header>

			{!isSearchMode && (
				<>
					<WelcomeBanner />
					<OnboardingChecklist />
				</>
			)}

			{!isSearchMode && (
				<FilterBar
					stack={stack}
					layer={layer}
					tag={tag}
					onFilterChange={handleFilterChange}
					total={data?.items?.length}
				/>
			)}

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{Array.from({ length: 9 }).map((_, i) => (
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
			) : isSearchMode || hasFilters ? (
				<EmptyState
					icon={SearchX}
					title={m.search_no_results({ query: q || tag || '' })}
					action={
						<Button variant="secondary" size="sm" onClick={clearAll}>
							{m.search_empty_clear()}
						</Button>
					}
				/>
			) : (
				<EmptyState
					icon={Blocks}
					title={m.onboarding_empty_title()}
					description={m.onboarding_empty_description()}
					action={
						<div className="flex flex-col items-center gap-3">
							<Link to="/blueprints/new" className="no-underline">
								<Button variant="primary">
									<Plus className="h-4 w-4" />
									{m.onboarding_empty_cta()}
								</Button>
							</Link>
							<p className="text-xs text-outline font-mono">{m.onboarding_empty_cli_hint()}</p>
							<p className="text-xs text-on-surface-variant">
								{m.onboarding_empty_search_label()}{' '}
								<Link
									to="/"
									search={{ q: 'NestJS CRUD controller with validation' }}
									className="text-primary hover:underline"
								>
									NestJS CRUD controller
								</Link>
							</p>
						</div>
					}
				/>
			)}
		</div>
	);
}
