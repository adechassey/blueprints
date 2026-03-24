import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
	content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
	return (
		<div className="prose prose-sm max-w-none dark:prose-invert">
			<Markdown
				remarkPlugins={[remarkGfm]}
				components={{
					code({ className, children, ...props }) {
						const match = /language-(\w+)/.exec(className || '');
						const code = String(children).replace(/\n$/, '');

						if (match) {
							return (
								<SyntaxHighlighter
									style={oneDark as Record<string, React.CSSProperties>}
									language={match[1]}
									PreTag="div"
									customStyle={{
										margin: '1rem 0',
										padding: '1.5rem',
										borderRadius: '0.75rem',
										fontSize: '0.875rem',
									}}
								>
									{code}
								</SyntaxHighlighter>
							);
						}

						return (
							<code
								className="px-1.5 py-0.5 rounded bg-surface-container-high text-sm font-mono"
								{...props}
							>
								{children}
							</code>
						);
					},
				}}
			>
				{content}
			</Markdown>
		</div>
	);
}
