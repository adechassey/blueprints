import { useCallback, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils.js';

interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
	const overlayRef = useRef<HTMLDivElement>(null);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		},
		[onClose],
	);

	useEffect(() => {
		if (open) {
			document.addEventListener('keydown', handleKeyDown);
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = '';
		};
	}, [open, handleKeyDown]);

	if (!open) return null;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: overlay dismiss pattern
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled via Escape key listener
		<div
			ref={overlayRef}
			className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === overlayRef.current) onClose();
			}}
		>
			<div className="bg-surface-container-lowest rounded-2xl shadow-hover p-6 max-w-md w-full mx-4 space-y-4">
				{children}
			</div>
		</div>
	);
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return <h2 className={cn('text-lg font-bold font-headline', className)} {...props} />;
}

export function DialogDescription({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return <p className={cn('text-sm text-on-surface-variant', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex justify-end gap-2 pt-2', className)} {...props} />;
}
