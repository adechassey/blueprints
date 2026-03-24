import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
	'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
	{
		variants: {
			variant: {
				default: 'bg-surface-container-high text-on-surface-variant',
				primary: 'bg-primary-container/10 text-primary',
				secondary: 'bg-secondary-container text-on-secondary-container',
				tertiary: 'bg-tertiary-container text-on-tertiary-container',
				success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
				error: 'bg-error/10 text-error',
				webapp: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
				server: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
				shared: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
				fullstack: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
