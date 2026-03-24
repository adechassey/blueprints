import * as m from '../paraglide/messages.js';

interface PaginationProps {
	page: number;
	total: number;
	limit: number;
	onPageChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
	const totalPages = Math.ceil(total / limit);
	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-between">
			<span className="text-sm text-gray-500">
				{m.pagination_showing({
					from: (page - 1) * limit + 1,
					to: Math.min(page * limit, total),
					total,
				})}
			</span>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
					className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
				>
					{m.pagination_prev()}
				</button>
				<button
					type="button"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
					className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
				>
					{m.pagination_next()}
				</button>
			</div>
		</div>
	);
}
