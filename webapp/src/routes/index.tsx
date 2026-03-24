import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { BlueprintList } from '../components/BlueprintList.js';
import { FilterBar } from '../components/FilterBar.js';
import { Pagination } from '../components/Pagination.js';
import { useBlueprints } from '../hooks/useBlueprints.js';
import * as m from '../paraglide/messages.js';

interface SearchParams {
	page?: number;
	stack?: string;
	layer?: string;
	tag?: string;
}

export const Route = createFileRoute('/')({
	validateSearch: (search: Record<string, unknown>): SearchParams => ({
		page: Number(search.page) || undefined,
		stack: (search.stack as string) || undefined,
		layer: (search.layer as string) || undefined,
		tag: (search.tag as string) || undefined,
	}),
	component: IndexPage,
});

function IndexPage() {
	const { page = 1, stack, layer, tag } = Route.useSearch();
	const navigate = useNavigate();
	const { data, isLoading } = useBlueprints({ page, stack, layer, tag });

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

	return (
		<>
			<h1 className="mb-6 text-2xl font-bold text-gray-900">{m.page_all_title()}</h1>
			<div className="mb-6">
				<FilterBar stack={stack} layer={layer} tag={tag} onFilterChange={handleFilterChange} />
			</div>
			{isLoading ? (
				<p className="text-sm text-gray-500">{m.loading()}</p>
			) : data?.items?.length ? (
				<>
					<BlueprintList blueprints={data.items} />
					<div className="mt-6">
						<Pagination
							page={data.page}
							total={data.total}
							limit={data.limit}
							onPageChange={handlePageChange}
						/>
					</div>
				</>
			) : (
				<p className="text-sm text-gray-500">{m.empty_state()}</p>
			)}
		</>
	);
}
