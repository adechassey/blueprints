const COMMENT_LINE_RE = /^\s*(?:\/\/|#|--|\*|\/\*|<!--)/;
const ANNOTATION_RE = /@Blueprint/;

export interface SplitExcerpt {
	/** The leading `@Blueprint…` comment block, empty when there is none. */
	annotation: string;
	/** The excerpt without that block. */
	code: string;
}

/**
 * Peels the leading `@Blueprint…` comment block off an excerpt. The marker is
 * metadata the page already shows as fields; the declaration is what readers
 * came for. Excerpts that do not start with an annotation, or that hold
 * nothing else, come back untouched.
 */
export function splitAnnotationHeader(excerpt: string): SplitExcerpt {
	const lines = excerpt.split('\n');
	let end = 0;
	while (end < lines.length && COMMENT_LINE_RE.test(lines[end] as string)) end++;

	const header = lines.slice(0, end);
	if (end === lines.length || !header.some((line) => ANNOTATION_RE.test(line))) {
		return { annotation: '', code: excerpt };
	}
	return { annotation: header.join('\n'), code: lines.slice(end).join('\n') };
}
