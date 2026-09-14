import { cn } from '../../lib/utils.js';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
	return (
		<select
			className={cn(
				'rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm font-medium text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer',
				className,
			)}
			{...props}
		/>
	);
}
