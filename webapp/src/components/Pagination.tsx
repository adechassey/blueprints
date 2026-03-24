import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as m from '../paraglide/messages.js';
import { Button } from './ui/button.js';

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
		<div className="flex items-center justify-between pt-6">
			<span className="text-sm text-on-surface-variant font-medium">
				{m.pagination_showing({
					from: (page - 1) * limit + 1,
					to: Math.min(page * limit, total),
					total,
				})}
			</span>
			<div className="flex gap-2">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
				>
					<ChevronLeft className="h-4 w-4" />
					{m.pagination_prev()}
				</Button>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
				>
					{m.pagination_next()}
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
