import { useCallback, useState } from 'react';
import { type BlueprintFrontmatter, parseBlueprintMarkdown } from '../lib/frontmatter.core.js';
import * as m from '../paraglide/messages.js';

interface DropZoneProps {
	onParsed: (meta: BlueprintFrontmatter, content: string) => void;
}

export function DropZone({ onParsed }: DropZoneProps) {
	const [isDragOver, setIsDragOver] = useState(false);

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
			className={`rounded-lg border-2 border-dashed p-6 text-center text-sm ${
				isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 text-gray-500'
			}`}
		>
			{m.dropzone_hint()}
		</div>
	);
}
