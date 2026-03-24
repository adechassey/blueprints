import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
	{
		variants: {
			variant: {
				primary:
					'bg-primary-container text-on-primary-container rounded-xl shadow-sm hover:brightness-110',
				secondary:
					'bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant/15 shadow-sm hover:bg-surface-bright',
				destructive: 'bg-error/10 text-error rounded-xl hover:bg-error/20',
				ghost: 'text-on-surface-variant rounded-lg hover:bg-surface-container-high',
				link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-4 py-2.5 text-sm',
				lg: 'px-6 py-3 text-base',
				icon: 'p-2',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
		},
	},
);

interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
	return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
