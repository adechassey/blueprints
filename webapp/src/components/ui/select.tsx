import { cn } from '../../lib/utils.js';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
	return (
		<select
			className={cn(
				'rounded-xl border-none bg-surface-container-high px-4 py-3 text-sm font-medium text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest cursor-pointer',
				className,
			)}
			{...props}
		/>
	);
}
