import { Check, Copy } from 'lucide-react';
import { lazy, Suspense, useCallback, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Lazy-loaded Prism (light build) with only the languages blueprints
 * actually use. Keeps react-syntax-highlighter and its languages out
 * of the main bundle.
 */
const LazyCodeBlock = lazy(async () => {
	const [{ PrismLight }, { default: oneDark }, tsx, ts, js, bash, json, yaml, python, css, md] =
		await Promise.all([
			import('react-syntax-highlighter'),
			import('react-syntax-highlighter/dist/esm/styles/prism'),
			import('react-syntax-highlighter/dist/esm/languages/prism/tsx'),
			import('react-syntax-highlighter/dist/esm/languages/prism/typescript'),
			import('react-syntax-highlighter/dist/esm/languages/prism/javascript'),
			import('react-syntax-highlighter/dist/esm/languages/prism/bash'),
			import('react-syntax-highlighter/dist/esm/languages/prism/json'),
			import('react-syntax-highlighter/dist/esm/languages/prism/yaml'),
			import('react-syntax-highlighter/dist/esm/languages/prism/python'),
			import('react-syntax-highlighter/dist/esm/languages/prism/css'),
			import('react-syntax-highlighter/dist/esm/languages/prism/markdown'),
		]);

	PrismLight.registerLanguage('tsx', tsx);
	PrismLight.registerLanguage('jsx', tsx);
	PrismLight.registerLanguage('typescript', ts);
	PrismLight.registerLanguage('ts', ts);
	PrismLight.registerLanguage('javascript', js);
	PrismLight.registerLanguage('js', js);
	PrismLight.registerLanguage('bash', bash);
	PrismLight.registerLanguage('sh', bash);
	PrismLight.registerLanguage('shell', bash);
	PrismLight.registerLanguage('json', json);
	PrismLight.registerLanguage('yaml', yaml);
	PrismLight.registerLanguage('yml', yaml);
	PrismLight.registerLanguage('python', python);
	PrismLight.registerLanguage('css', css);
	PrismLight.registerLanguage('markdown', md);

	function LazyPrismBlock({ language, code }: { language: string; code: string }) {
		return (
			<PrismLight
				language={language}
				style={oneDark as Record<string, React.CSSProperties>}
				PreTag="div"
				customStyle={{
					margin: '1.25rem 0',
					padding: '1.25rem',
					borderRadius: '0.75rem',
					fontSize: '0.8125rem',
					border: '1px solid rgba(255,255,255,0.08)',
				}}
				codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
			>
				{code}
			</PrismLight>
		);
	}

	return { default: LazyPrismBlock };
});

function CodeBlockSkeleton(): React.ReactElement {
	return <div className="my-4 h-48 animate-pulse rounded-lg bg-surface-container-high" />;
}

interface LazyCodeBlockProps {
	language: string;
	code: string;
}

function CodeBlock({ language, code }: LazyCodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, [code]);

	return (
		<div className="group/code relative">
			<button
				type="button"
				onClick={handleCopy}
				aria-label="Copy code"
				className="absolute top-3 right-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/10 text-zinc-300 opacity-0 backdrop-blur-sm transition-all group-hover/code:opacity-100 hover:bg-white/20 hover:text-white focus-visible:opacity-100"
			>
				{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
			</button>
			<Suspense fallback={<CodeBlockSkeleton />}>
				<LazyCodeBlock language={language} code={code} />
			</Suspense>
		</div>
	);
}

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
							return <CodeBlock language={match[1] ?? 'text'} code={code} />;
						}

						return (
							<code
								className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-sm text-on-surface"
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
