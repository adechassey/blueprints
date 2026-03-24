import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { type BlueprintFrontmatter, parseBlueprintMarkdown } from '../lib/frontmatter.core.js';
import * as m from '../paraglide/messages.js';
import { Button } from './ui/button.js';

interface DropZoneProps {
	onParsed: (meta: BlueprintFrontmatter, content: string) => void;
}

export function DropZone({ onParsed }: DropZoneProps) {
	const [isDragOver, setIsDragOver] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = useCallback(
		(file: File) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const raw = e.target?.result as string;
				const { meta, content } = parseBlueprintMarkdown(raw);
				onParsed(meta, content);
			};
			reader.readAsText(file);
		},
		[onParsed],
	);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: drop zone uses drag events
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragOver(true);
			}}
			onDragLeave={() => setIsDragOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setIsDragOver(false);
				const file = e.dataTransfer.files[0];
				if (file?.name.endsWith('.md')) {
					handleFile(file);
				}
			}}
			className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
				isDragOver
					? 'border-primary bg-primary/5'
					: 'border-outline-variant text-on-surface-variant'
			}`}
		>
			<Upload className="h-8 w-8 text-outline" />
			<span className="text-sm">{m.dropzone_hint()}</span>
			<input
				ref={inputRef}
				type="file"
				accept=".md"
				className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFile(file);
				}}
			/>
			<Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
				{m.dropzone_browse()}
			</Button>
		</div>
	);
}
