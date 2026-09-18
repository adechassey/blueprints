import { CopyButton } from './CopyButton.js';

/** Splits a snippet into lines with stable keys (content + occurrence, not index). */
function keyedLines(code: string): { key: string; line: string }[] {
	const seen = new Map<string, number>();
	return code.split('\n').map((line) => {
		const occurrence = (seen.get(line) ?? 0) + 1;
		seen.set(line, occurrence);
		return { key: `${line}#${occurrence}`, line };
	});
}

/** Renders shell lines: comments muted, commands prefixed with a non-selectable prompt. */
function ShellLines({ code }: { code: string }) {
	return keyedLines(code).map(({ key, line }) => {
		if (line.trim() === '') {
			return (
				<span key={key} className="block">
					{' '}
				</span>
			);
		}
		if (line.startsWith('#')) {
			return (
				<span key={key} className="block text-on-surface-variant/80">
					{line}
				</span>
			);
		}
		return (
			<span key={key} className="block">
				<span aria-hidden="true" className="select-none text-primary/70">
					${' '}
				</span>
				{line}
			</span>
		);
	});
}

/**
 * Renders non-shell snippets (source, JSON) verbatim: no prompt, no comment
 * dimming — a `#` opens a comment in shell, but a JSON key in a settings block.
 */
function PlainLines({ code }: { code: string }) {
	return keyedLines(code).map(({ key, line }) => (
		<span key={key} className="block">
			{line === '' ? ' ' : line}
		</span>
	));
}

/**
 * A copy-ready code block. `shell` (the default) prefixes each command with a
 * prompt; pass `language="plain"` for anything that is not typed at a terminal.
 */
export function CodeBlock({
	code,
	header,
	language = 'shell',
}: {
	code: string;
	header: React.ReactNode;
	language?: 'shell' | 'plain';
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low">
			<div className="flex items-center justify-between gap-3 border-b border-outline-variant/50 bg-surface-container/60 py-1.5 pr-1.5 pl-4">
				<div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
					{header}
				</div>
				<CopyButton code={code} />
			</div>
			<pre className="overflow-x-auto p-4 text-sm leading-relaxed">
				<code>
					{language === 'shell' ? <ShellLines code={code} /> : <PlainLines code={code} />}
				</code>
			</pre>
		</div>
	);
}

/** The muted caption above a code block ("Terminal", "macOS / Linux", a file path). */
export function BlockLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-medium text-on-surface-variant uppercase tracking-wide">{children}</span>
	);
}

/** A guide section, numbered when it is one step of an ordered walkthrough. */
export function Section({
	step,
	title,
	description,
	badge,
	children,
}: {
	step?: number;
	title: string;
	description: string;
	badge?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-4">
			<div className="space-y-1.5">
				<div className="flex items-center gap-3">
					{step !== undefined && (
						<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
							{step}
						</span>
					)}
					<h2 className="font-semibold text-xl">{title}</h2>
					{badge}
				</div>
				<p className={`text-on-surface-variant text-sm ${step !== undefined ? 'sm:pl-10' : ''}`}>
					{description}
				</p>
			</div>
			{children}
		</section>
	);
}

/** A caveat worth stopping on: the gotchas that silently cost an afternoon. */
export function Callout({ children }: { children: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-outline-variant/50 border-l-4 border-l-primary/60 bg-surface-container-low/60 px-4 py-3 text-on-surface-variant text-sm">
			{children}
		</div>
	);
}
