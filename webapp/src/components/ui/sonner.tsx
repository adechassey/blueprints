import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
	return (
		<Sonner
			className="toaster group"
			position="bottom-right"
			toastOptions={{
				classNames: {
					toast:
						'group-[.toaster]:bg-surface-container-lowest group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant group-[.toaster]:shadow-hover group-[.toaster]:rounded-lg',
					description: 'group-[.description]:text-on-surface-variant',
				},
			}}
			{...props}
		/>
	);
}
