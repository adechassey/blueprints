import { cn } from '../../lib/utils.js';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
	return (
		<div className="relative w-full overflow-x-auto">
			<table className={cn('w-full caption-bottom text-sm', className)} {...props} />
		</div>
	);
}

export function TableHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
	return (
		<thead className={cn('[&_tr]:border-b [&_tr]:border-outline-variant', className)} {...props} />
	);
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr
			className={cn(
				'border-b border-outline-variant transition-colors hover:bg-surface-container-low/60 data-[state=selected]:bg-surface-container-low',
				className,
			)}
			{...props}
		/>
	);
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			className={cn(
				'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-outline',
				className,
			)}
			{...props}
		/>
	);
}

export function TableCell({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) {
	return <td className={cn('px-4 py-3.5 align-middle', className)} {...props} />;
}
