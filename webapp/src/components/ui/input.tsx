import { cn } from '../../lib/utils.js';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
	return (
		<input
			className={cn(
				'w-full rounded-xl border-none bg-surface-container-high px-4 py-3 text-sm text-on-surface placeholder:text-outline outline-none transition-all focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest',
				className,
			)}
			{...props}
		/>
	);
}
