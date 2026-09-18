export interface InlineSegment {
	kind: 'text' | 'code';
	value: string;
	/** Position in the source text, stable across re-renders. */
	offset: number;
}

/**
 * Splits a plain-text field into text and `code` spans. Unlike markdown,
 * nothing else is interpreted: the asterisks of a glob stay literal instead
 * of turning into emphasis. A backtick without a closing one is ordinary text.
 */
export function splitInlineCode(text: string): InlineSegment[] {
	const segments: InlineSegment[] = [];
	let offset = 0;
	let rest = text;

	while (rest.length > 0) {
		const open = rest.indexOf('`');
		const close = open === -1 ? -1 : rest.indexOf('`', open + 1);
		if (open === -1 || close === -1) {
			segments.push({ kind: 'text', value: rest, offset });
			break;
		}
		if (open > 0) segments.push({ kind: 'text', value: rest.slice(0, open), offset });
		const code = rest.slice(open + 1, close);
		if (code.length > 0) segments.push({ kind: 'code', value: code, offset: offset + open + 1 });
		offset += close + 1;
		rest = rest.slice(close + 1);
	}

	return segments;
}
