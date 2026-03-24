interface MarkdownRendererProps {
	content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
	return (
		<div className="prose prose-sm max-w-none">
			<pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
		</div>
	);
}
