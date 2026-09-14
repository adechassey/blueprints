import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				primary:
					'bg-primary-container text-on-primary-container rounded-lg shadow-xs hover:bg-primary-dim active:bg-primary-dim',
				secondary:
					'bg-surface-container-lowest text-on-surface rounded-lg border border-outline-variant shadow-xs hover:bg-surface-container-high hover:border-outline',
				destructive: 'bg-error/10 text-error rounded-lg border border-error/20 hover:bg-error/20',
				ghost:
					'text-on-surface-variant rounded-lg hover:bg-surface-container-high hover:text-on-surface',
				link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
			},
			size: {
				sm: 'px-3 py-1.5 text-sm',
				md: 'px-4 py-2.5 text-sm',
				lg: 'px-5 py-2.5 text-sm',
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
