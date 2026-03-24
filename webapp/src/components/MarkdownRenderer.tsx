import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
	content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
	return (
		<div className="prose prose-sm max-w-none">
			<Markdown
				remarkPlugins={[remarkGfm]}
				components={{
					code({ className, children, ...props }) {
						const match = /language-(\w+)/.exec(className || '');
						const code = String(children).replace(/\n$/, '');

						if (match) {
							return (
								<SyntaxHighlighter
									style={oneLight as Record<string, React.CSSProperties>}
									language={match[1]}
									PreTag="div"
								>
									{code}
								</SyntaxHighlighter>
							);
						}

						return (
							<code className={className} {...props}>
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
