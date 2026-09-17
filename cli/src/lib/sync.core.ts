/**
 * Pure logic for the `sync` command: parse the TSV blueprint index generated
 * by the `blueprint` skill (index.sh) and convert rows into registry payloads.
 * No I/O — 100% test coverage required.
 *
 * TSV columns (from the skill's index.sh):
 *   id, name, usage, description, globs (comma-separated), location (file:line)
 */

export interface BlueprintIndexRow {
	id: string;
	name: string;
	usage: string;
	description: string;
	globs: string;
	location: string;
}

const TSV_COLUMNS = 6;

export function parseIndexTsv(raw: string): BlueprintIndexRow[] {
	return raw
		.split('\n')
		.map((line) => line.split('\t'))
		.filter((cols) => cols.length === TSV_COLUMNS && (cols[0] as string).trim() !== '')
		.map((cols) => ({
			id: (cols[0] as string).trim(),
			name: cols[1] as string,
			usage: cols[2] as string,
			description: cols[3] as string,
			globs: cols[4] as string,
			location: cols[5] as string,
		}));
}

/** Splits a "path:line" location into its path and line number. */
export function splitLocation(location: string): { path: string; line: number | undefined } {
	const idx = location.lastIndexOf(':');
	if (idx === -1) return { path: location, line: undefined };
	const path = location.slice(0, idx);
	const line = Number(location.slice(idx + 1));
	return { path, line: Number.isInteger(line) && line > 0 ? line : undefined };
}

const LAYER_GLOB_PATTERNS: Array<[RegExp, string]> = [
	[/\.controller\./, 'controller'],
	[/\.service\./, 'service'],
	[/\.repository\./, 'repository'],
	[/\.middleware\./, 'middleware'],
	[/\.guard\./, 'guard'],
	[/\.hook\./, 'hook'],
	[/[\\/]hooks[\\/]/, 'hook'],
];

/**
 * Infers the architecture layer from the row's globs: the first positive glob's
 * filename convention (e.g. `*.controller.ts`) or its extension (`.tsx` →
 * component). Falls back when globs are absent or unrecognized.
 */
export function inferLayer(globs: string, fallback = 'pattern'): string {
	// biome-ignore lint/style/noNonNullAssertion: split always returns at least one element
	const firstGlob = globs.split(',')[0]!.trim().replace(/^!/, '');
	if (!firstGlob) return fallback;
	for (const [pattern, layer] of LAYER_GLOB_PATTERNS) {
		if (pattern.test(firstGlob)) return layer;
	}
	if (/\.(tsx|jsx)$/.test(firstGlob)) return 'component';
	return fallback;
}

const COMMENT_LINE_RE = /^\s*(\/\/|\/\*|\*|#)/;

/**
 * Maximum number of lines in an extracted excerpt (annotation block + body).
 * A safety net for pathological inputs: the excerpt is truncated rather than
 * dumping an entire file into a blueprint.
 */
export const MAX_EXCERPT_LINES = 150;

export interface ScanState {
	/** Open quote character (`'`, `"` or `` ` ``) while inside a string literal. */
	inStr: string | null;
	/** True while inside a `/* ... *\/` block comment. */
	inBlock: boolean;
}

/**
 * Bracket depth delta of one line, skipping string literals (single, double,
 * template — escaped chars and multi-line template spans via `state`), line
 * comments (`//`, `#` for Python/Ruby/Shell) and block comments. Braces inside
 * template expressions (`${...}`) are ignored with the rest of the literal.
 */
export function scanLine(line: string, state: ScanState): number {
	let depth = 0;
	let i = 0;
	while (i < line.length) {
		if (state.inBlock) {
			const end = line.indexOf('*/', i);
			if (end === -1) return depth;
			i = end + 2;
			state.inBlock = false;
			continue;
		}
		const ch = line[i] as string;
		if (state.inStr) {
			if (ch === '\\') {
				i += 2;
				continue;
			}
			if (ch === state.inStr) state.inStr = null;
			i++;
			continue;
		}
		if (ch === '/' && line[i + 1] === '/') return depth;
		if (ch === '/' && line[i + 1] === '*') {
			state.inBlock = true;
			i += 2;
			continue;
		}
		if (ch === '#') return depth;
		if (ch === "'" || ch === '"' || ch === '`') {
			state.inStr = ch;
			i++;
			continue;
		}
		if (ch === '{' || ch === '(' || ch === '[') depth++;
		else if (ch === '}' || ch === ')' || ch === ']') depth--;
		i++;
	}
	return depth;
}

/**
 * Extracts the exemplar excerpt: the annotation comment block starting at
 * `line`, plus the full declaration body that follows it — the body is
 * bracket-balanced (braces/parens/brackets opened by the declaration must
 * close before the excerpt ends), string/comment aware. Python-style
 * indentation blocks (declaration ending with `:`) are followed by indent
 * level instead. Returns undefined when the line number is out of bounds,
 * and truncates at `MAX_EXCERPT_LINES` lines.
 */
export function extractExcerpt(content: string, line: number): string | undefined {
	const lines = content.split('\n');
	const start = line - 1;
	if (!Number.isInteger(line) || line < 1 || start >= lines.length) return undefined;

	// 1) The annotation comment block: every line up to the first code line.
	let declIndex = start;
	while (declIndex + 1 < lines.length && COMMENT_LINE_RE.test(lines[declIndex + 1] as string)) {
		declIndex++;
	}

	// 2) The declaration body. Comments at EOF (no declaration) end the excerpt.
	let last = declIndex;
	const decl = lines[declIndex + 1];
	if (decl !== undefined) {
		last = declIndex + 1;
		const state: ScanState = { inStr: null, inBlock: false };
		let depth = scanLine(decl, state);
		const cap = start + MAX_EXCERPT_LINES;
		if (depth > 0) {
			// Braced body (TS/Java/Go/Rust/C/…): consume until brackets close.
			for (let i = declIndex + 2; i < lines.length && i < cap; i++) {
				last = i;
				const d = scanLine(lines[i] as string, state);
				if (depth + d <= 0) break;
				depth += d;
			}
		} else if (/:\s*$/.test(decl)) {
			// Indentation body (Python): consume lines indented deeper than the
			// declaration.
			const indent = decl.length - decl.trimStart().length;
			for (let i = declIndex + 2; i < lines.length && i < cap; i++) {
				const l = lines[i] as string;
				if (l.trim() === '') continue;
				if (l.length - l.trimStart().length <= indent) break;
				last = i;
			}
		}
	}

	// Clamp the excerpt to the cap (a long annotation block can overflow it), then join.
	return lines.slice(start, Math.min(last, start + MAX_EXCERPT_LINES - 1) + 1).join('\n');
}

const EXTENSION_TO_LANG: Record<string, string> = {
	ts: 'typescript',
	tsx: 'tsx',
	js: 'javascript',
	jsx: 'jsx',
	py: 'python',
	go: 'go',
	rs: 'rust',
	rb: 'ruby',
	java: 'java',
	kt: 'kotlin',
	php: 'php',
	sh: 'sh',
};

function langFromPath(path: string): string | undefined {
	const ext = path.split('.').pop();
	return ext ? EXTENSION_TO_LANG[ext] : undefined;
}

/** Builds the "repo:path:line" source reference stored on the blueprint. */
export function buildSource(repo: string | undefined, location: string): string {
	const { path, line } = splitLocation(location);
	const loc = line === undefined ? path : `${path}:${line}`;
	return repo ? `${repo}:${loc}` : loc;
}

/** Builds the blueprint markdown body from an index row (and optional excerpt). */
export function buildBlueprintContent(row: BlueprintIndexRow, excerpt?: string): string {
	const { path, line } = splitLocation(row.location);
	const loc = line === undefined ? `\`${path}\`` : `\`${path}:${line}\``;

	const sections = [
		'## Context',
		'',
		row.description || `Pattern \`${row.id}\` — canonical exemplar in the source codebase.`,
		'',
		'## Usage',
		'',
		row.usage,
		'',
		'## Implementation',
		'',
		`Exemplar: ${loc}`,
	];

	if (excerpt) {
		const lang = langFromPath(path);
		sections.push('', `\`\`\`${lang ?? ''}`, excerpt, '```');
	}

	return `${sections.join('\n')}\n`;
}

/**
 * Slugs of the projects that own an existing blueprint and are not the sync's
 * target: a non-empty result means the blueprint belongs to someone else and
 * must not be overwritten. A blueprint without a project (global pool) is
 * never foreign, nor is one already in the target project.
 */
export function foreignProjects(
	owners: Array<{ id: string; slug: string }>,
	targetProjectId: string | undefined,
): string[] {
	if (targetProjectId !== undefined && owners.some((p) => p.id === targetProjectId)) return [];
	return owners.map((p) => p.slug);
}
