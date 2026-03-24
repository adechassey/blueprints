import { cn } from '../../lib/utils.js';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				'bg-surface-container-lowest rounded-xl shadow-rest transition-all duration-300',
				className,
			)}
			{...props}
		/>
	);
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('p-6', className)} {...props} />;
}
