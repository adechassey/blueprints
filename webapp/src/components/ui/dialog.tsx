import { Dialog as DialogPrimitive } from 'radix-ui';
import { cn } from '../../lib/utils.js';

interface DialogProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	className?: string;
}

/**
 * shadcn Dialog (Radix primitive) behind the app's controlled `open`/`onClose`
 * API. Radix stacks dismissable layers: Escape or an outside click closes a
 * popover opened inside the dialog, not the dialog itself.
 */
export function Dialog({ open, onClose, children, className }: DialogProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-inverse-surface/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<DialogPrimitive.Content
					className={cn(
						'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-hover outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
						className,
					)}
				>
					{children}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={cn('text-lg font-bold font-headline', className)}
			{...props}
		/>
	);
}

export function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={cn('text-sm text-on-surface-variant', className)}
			{...props}
		/>
	);
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex justify-end gap-2 pt-2', className)} {...props} />;
}
