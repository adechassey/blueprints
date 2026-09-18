import { splitInlineCode } from '../lib/inline-code.core.js';

/**
 * A plain-text field with its `code` spans rendered as chips. Nothing else is
 * interpreted, so the text reads exactly as it was written.
 */
export function InlineCodeText({ text }: { text: string }) {
	return (
		<>
			{splitInlineCode(text).map((segment) =>
				segment.kind === 'code' ? (
					<code
						key={segment.offset}
						className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.875em] text-on-surface"
					>
						{segment.value}
					</code>
				) : (
					<span key={segment.offset}>{segment.value}</span>
				),
			)}
		</>
	);
}
