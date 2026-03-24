import { cn } from '../../lib/utils.js';

interface AvatarProps {
	src?: string | null;
	alt?: string;
	fallback?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}

const sizeClasses = {
	sm: 'h-6 w-6 text-[10px]',
	md: 'h-8 w-8 text-xs',
	lg: 'h-10 w-10 text-sm',
	xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, alt = '', fallback, size = 'md', className }: AvatarProps) {
	if (src) {
		return (
			<img
				src={src}
				alt={alt}
				className={cn(
					'rounded-full object-cover border-2 border-transparent',
					sizeClasses[size],
					className,
				)}
			/>
		);
	}

	return (
		<div
			className={cn(
				'flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
				sizeClasses[size],
				className,
			)}
		>
			{fallback?.charAt(0)?.toUpperCase()}
		</div>
	);
}
