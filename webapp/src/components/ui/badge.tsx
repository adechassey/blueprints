import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
	'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide',
	{
		variants: {
			variant: {
				default: 'bg-surface-container-high text-on-surface-variant',
				primary: 'bg-primary/10 text-primary',
				secondary: 'bg-secondary-container text-on-secondary-container',
				tertiary:
					'bg-tertiary-container/40 text-on-tertiary-container dark:bg-tertiary-container dark:text-tertiary',
				success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
				error: 'bg-error/10 text-error',
				database: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
				api: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
				domain: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
				ui: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
				state: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
				infra: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
				testing: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
				tooling: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
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
