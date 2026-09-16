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
 * Extracts the exemplar excerpt: the annotation comment block starting at
 * `line`, plus the declaration line that follows it. Returns undefined when
 * the line number is out of bounds.
 */
export function extractExcerpt(content: string, line: number): string | undefined {
	const lines = content.split('\n');
	const start = line - 1;
	if (!Number.isInteger(line) || line < 1 || start >= lines.length) return undefined;

	let end = start;
	for (let i = start; i < lines.length; i++) {
		if (i > start && !COMMENT_LINE_RE.test(lines[i] as string)) {
			end = i; // first line after the comment block: the declaration
			break;
		}
		end = i;
	}
	return lines.slice(start, end + 1).join('\n');
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
