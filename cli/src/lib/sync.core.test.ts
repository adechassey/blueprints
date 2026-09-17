import { describe, expect, it } from 'vitest';
import {
	buildBlueprintContent,
	buildSource,
	extractExcerpt,
	foreignProjects,
	inferLayer,
	MAX_EXCERPT_LINES,
	parseIndexTsv,
	type ScanState,
	scanLine,
	splitLocation,
} from './sync.core.js';

describe('parseIndexTsv', () => {
	it('parses well-formed rows', () => {
		const raw =
			'controller-create\tController Create\tUse for POST endpoints\tCreates a resource\tsrc/**/*.controller.ts\tsrc/areas/area.controller.ts:42';
		const rows = parseIndexTsv(raw);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toEqual({
			id: 'controller-create',
			name: 'Controller Create',
			usage: 'Use for POST endpoints',
			description: 'Creates a resource',
			globs: 'src/**/*.controller.ts',
			location: 'src/areas/area.controller.ts:42',
		});
	});

	it('parses multiple rows and trims ids', () => {
		const raw = [
			'a-id\tA\tUse for a\tDoes a\t\tfile.ts:1',
			'b-id\tB\tUse for b\tDoes b\t\tfile2.ts:2',
		].join('\n');
		const rows = parseIndexTsv(raw);
		expect(rows.map((r) => r.id)).toEqual(['a-id', 'b-id']);
	});

	it('skips malformed rows (wrong column count) and empty ids', () => {
		const raw = [
			'only-three\tcolumns\there',
			'\tNo id\tUse for x\tDesc\t\tfile.ts:1',
			'',
			'good-id\tGood\tUse for good\tDoes good\t\tg.ts:3',
		].join('\n');
		expect(parseIndexTsv(raw).map((r) => r.id)).toEqual(['good-id']);
	});

	it('returns an empty array for empty input', () => {
		expect(parseIndexTsv('')).toEqual([]);
	});
});

describe('splitLocation', () => {
	it('splits path and line', () => {
		expect(splitLocation('src/a.ts:42')).toEqual({ path: 'src/a.ts', line: 42 });
	});

	it('handles paths without a line', () => {
		expect(splitLocation('src/a.ts')).toEqual({ path: 'src/a.ts', line: undefined });
	});

	it('returns undefined for invalid line numbers', () => {
		expect(splitLocation('src/a.ts:abc').line).toBeUndefined();
		expect(splitLocation('src/a.ts:0').line).toBeUndefined();
		expect(splitLocation('src/a.ts:-1').line).toBeUndefined();
	});

	it('keeps path intact when it contains colons beyond the last one', () => {
		expect(splitLocation('a:b.ts:7')).toEqual({ path: 'a:b.ts', line: 7 });
	});
});

describe('inferLayer', () => {
	it.each([
		['src/**/*.controller.ts', 'api'],
		['src/**/*.service.ts', 'domain'],
		['src/**/*.repository.ts', 'database'],
		['src/**/*.middleware.ts', 'api'],
		['src/**/*.guard.ts', 'api'],
		['src/**/*.hook.ts', 'ui'],
		['src/hooks/useAuth.ts', 'ui'],
		['src/**/*.tsx', 'ui'],
		['src/**/*.jsx', 'ui'],
	])('infers layer from glob %s', (glob, expected) => {
		expect(inferLayer(glob)).toBe(expected);
	});

	it('uses only the first glob when several are declared', () => {
		expect(inferLayer('src/**/*.service.ts, src/**/*.controller.ts')).toBe('domain');
	});

	it('ignores a leading exclusion glob and falls back', () => {
		expect(inferLayer('!**/*.test.ts, src/**/*.unknown.ts', 'fallback')).toBe('fallback');
	});

	it('returns the fallback when globs are empty', () => {
		expect(inferLayer('')).toBe('domain');
		expect(inferLayer('', 'unknown')).toBe('unknown');
	});
});

describe('scanLine', () => {
	it('counts positive and negative bracket deltas', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('foo({ [', state).depth).toBe(3);
		expect(scanLine('}) ]', state).depth).toBe(-3);
	});

	it('ignores brackets inside string literals', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('const s = "a{b(c[d";', state).depth).toBe(0);
		expect(state.inStr).toBeNull();
	});

	it('ignores escaped quotes inside strings', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('const s = "a\\"; b";', state).depth).toBe(0);
		expect(state.inStr).toBeNull();
	});

	it('carries an open string across lines', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('const s = "open', state).depth).toBe(0);
		expect(state.inStr).toBe('"');
		expect(scanLine('} close";', state).depth).toBe(0);
		expect(state.inStr).toBeNull();
	});

	it('ignores brackets inside template literals spanning lines', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('const s = `a{', state).depth).toBe(0);
		expect(state.inStr).toBe('`');
		expect(scanLine('b} c`;', state).depth).toBe(0);
	});

	it('ignores brackets in line comments (// and #)', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('foo({ // { [ open', state).depth).toBe(2);
		expect(scanLine('foo( # { [ open', state).depth).toBe(1);
	});

	it('ignores brackets inside block comments, within and across lines', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('foo({ /* { [ open', state).depth).toBe(2);
		expect(state.inBlock).toBe(true);
		expect(scanLine('still comment {', state).depth).toBe(0);
		expect(scanLine('comment ends */ {', state).depth).toBe(1);
		expect(state.inBlock).toBe(false);
	});

	it('handles a complete block comment within one line', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('a /* { } */ b {', state).depth).toBe(1);
		expect(state.inBlock).toBe(false);
	});

	it('returns the code without its comments, strings kept verbatim', () => {
		const state: ScanState = { inStr: null, inBlock: false };
		expect(scanLine('const a = "x // y" + 1; // see docs.', state).code).toBe(
			'const a = "x // y" + 1; ',
		);
		expect(scanLine('b = "q\\"" # note', state).code).toBe('b = "q\\"" ');
		expect(scanLine('c /* d */ e /* open', state).code).toBe('c  e ');
		expect(scanLine('still */ f', state).code).toBe(' f');
	});

	it('reads a JS quote right after an identifier character as JSX text', () => {
		const state: ScanState = { inStr: null, inBlock: false, js: true };
		expect(scanLine("<p>Choix de l'imprimante {", state).depth).toBe(1);
		expect(scanLine('<p>Écran 12" réservé à l\'équipe (', state).depth).toBe(1);
		expect(state.inStr).toBeNull();
		expect(scanLine('\'{\' + f("(")', state).depth).toBe(0);
	});

	it('closes a JS quote literal left open at the end of its line', () => {
		const state: ScanState = { inStr: null, inBlock: false, js: true };
		expect(scanLine("<p>'90s {", state).depth).toBe(0);
		expect(state.inStr).toBeNull();
		expect(scanLine('<p>"quoted {', state).depth).toBe(0);
		expect(state.inStr).toBeNull();
		expect(scanLine("const s = 'continued \\", state).depth).toBe(0);
		expect(state.inStr).toBe("'");
		expect(scanLine("line';", state).depth).toBe(0);
		expect(scanLine('const t = `open {', state).depth).toBe(0);
		expect(state.inStr).toBe('`');
	});
});

describe('extractExcerpt', () => {
	const file = [
		'// @Blueprint controller-create',
		'// @BlueprintName Create',
		'export const x = 1;',
		'const y = 2;',
	].join('\n');

	it('extracts the comment block plus the declaration line', () => {
		expect(extractExcerpt(file, 1)?.code).toBe(
			'// @Blueprint controller-create\n// @BlueprintName Create\nexport const x = 1;',
		);
	});

	it('supports block comments and # comments', () => {
		const jsdoc = ['/** @Blueprint ctrl */', ' * more', 'export const a;'].join('\n');
		expect(extractExcerpt(jsdoc, 1)?.code).toBe('/** @Blueprint ctrl */\n * more\nexport const a;');
		const py = ['# @Blueprint ctrl', 'class A: ...', 'x = 1'].join('\n');
		expect(extractExcerpt(py, 1)?.code).toBe('# @Blueprint ctrl\nclass A: ...');
	});

	it('returns undefined for out-of-bounds lines', () => {
		expect(extractExcerpt(file, 0)).toBeUndefined();
		expect(extractExcerpt(file, 99)).toBeUndefined();
		expect(extractExcerpt(file, Number.NaN)).toBeUndefined();
	});

	it('runs to end of file when only comments remain', () => {
		const onlyComments = '// @Blueprint a\n// @BlueprintName A';
		expect(extractExcerpt(onlyComments, 1)?.code).toBe(onlyComments);
	});

	it('captures the full body of a braced declaration', () => {
		const src = [
			'// @Blueprint service-create',
			'async create(input: CreateArea) {',
			'\tconst existing = await this.repository.findOne(input.name);',
			'\tif (existing) {',
			'\t\tthrow DuplicateAreaName(input.name);',
			'\t}',
			'\treturn this.repository.create(input);',
			'}',
			'async update() {',
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(
			[
				'// @Blueprint service-create',
				'async create(input: CreateArea) {',
				'\tconst existing = await this.repository.findOne(input.name);',
				'\tif (existing) {',
				'\t\tthrow DuplicateAreaName(input.name);',
				'\t}',
				'\treturn this.repository.create(input);',
				'}',
			].join('\n'),
		);
	});

	it('keeps nested @Blueprint follower annotations inside the body', () => {
		const src = [
			'// @Blueprint service-create',
			'async create() {',
			'\t// @Blueprint audit-log-emit',
			'\tthis.audit.emit();',
			'}',
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(src);
	});

	it('stops at the first declaration when it closes on the same line', () => {
		const src = '// @Blueprint a\nfunction f() { return 1; }\nfunction g() { return 2; }';
		expect(extractExcerpt(src, 1)?.code).toBe('// @Blueprint a\nfunction f() { return 1; }');
	});

	it('ignores brackets inside strings and comments of the body', () => {
		const src = [
			'// @Blueprint a',
			'function f() {',
			'\tconst s = "unbalanced { [ (";',
			'\t// comment } close',
			'\treturn 1;',
			'}',
			'function g() {}',
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(src.split('\n').slice(0, 6).join('\n'));
	});

	it('handles multi-line template literals in the body', () => {
		const src = [
			'// @Blueprint a',
			'function f() {',
			'\tconst s = `line1 {',
			'\tline2 }`;',
			'\treturn 1;',
			'}',
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(src);
	});

	it('follows Python indentation blocks', () => {
		const src = [
			'# @Blueprint user-repository',
			'class UserRepository:',
			'    def create(self, dto):',
			'        existing = self.repo.find_one(dto.name)',
			'        return self.repo.create(dto)',
			'def helper(): ...',
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(src.split('\n').slice(0, 5).join('\n'));
	});

	it('trims trailing blank lines of an indented body', () => {
		const src = ['# @Blueprint a', 'def f():', '    return 1', '', '', 'def g(): ...'].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe('# @Blueprint a\ndef f():\n    return 1');
	});

	it('runs the indented body to end of file', () => {
		const src = '# @Blueprint a\ndef f():\n    return 1\n\n';
		expect(extractExcerpt(src, 1)?.code).toBe('# @Blueprint a\ndef f():\n    return 1');
	});

	it('truncates at MAX_EXCERPT_LINES when the body never closes', () => {
		const body = Array.from({ length: 300 }, (_, i) => `\tif (${i}) {`).join('\n');
		const src = `// @Blueprint a\nfunction f() {\n${body}`;
		const excerpt = extractExcerpt(src, 1);
		expect(excerpt?.code.split('\n')).toHaveLength(MAX_EXCERPT_LINES);
		expect(excerpt?.truncated).toBe(true);
	});

	it('truncates a long annotation block at MAX_EXCERPT_LINES', () => {
		const comments = Array.from({ length: 300 }, (_, i) => `// line ${i}`).join('\n');
		const excerpt = extractExcerpt(`${comments}\nexport const x;`, 1);
		expect(excerpt?.code.split('\n')).toHaveLength(MAX_EXCERPT_LINES);
		expect(excerpt?.truncated).toBe(true);
	});

	it('does not flag a declaration that fits exactly within the cap', () => {
		const body = Array.from({ length: MAX_EXCERPT_LINES - 3 }, (_, i) => `\tcall(${i});`);
		const src = ['// @Blueprint a', 'function f() {', ...body, '}', 'function g() {}'].join('\n');
		const excerpt = extractExcerpt(src, 1);
		expect(excerpt?.code.split('\n')).toHaveLength(MAX_EXCERPT_LINES);
		expect(excerpt?.truncated).toBe(false);
	});

	it('returns only the annotation when it sits on the last line', () => {
		const src = '// @Blueprint a';
		expect(extractExcerpt(src, 1)?.code).toBe('// @Blueprint a');
	});

	it('follows a method chain that starts on the line after the declaration', () => {
		const src = [
			'// @Blueprint url-schema',
			'export const urlSchema = z',
			'\t.object({',
			'\t\tdtDeb: z.iso.date().catch(DEFAULT),',
			'\t})',
			'\t// sort and pagination',
			'\t.merge(paginationSchema);',
			'',
			'export type UrlParams = z.infer<typeof urlSchema>;',
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(src.split('\n').slice(0, 7).join('\n'));
	});

	it('follows a statement carried by a trailing operator or a leading union', () => {
		const arrow = [
			'// @Blueprint not-found',
			'export const NotFound = (id: string) =>',
			'\tnew NotFoundError({ id });',
			'export const Other = 1;',
		].join('\n');
		expect(extractExcerpt(arrow, 1)?.code).toBe(arrow.split('\n').slice(0, 3).join('\n'));
		const union = [
			'// @Blueprint filtre',
			'export type Filtre =',
			'\t| { kind: "a" }',
			'\t| { kind: "b" };',
			'export type Other = string;',
		].join('\n');
		expect(extractExcerpt(union, 1)?.code).toBe(union.split('\n').slice(0, 4).join('\n'));
	});

	it('does not continue on a trailing comma, spread, increment or commented operator', () => {
		const entries = [
			'\t// @Blueprint column',
			'\tcolumnHelper.accessor("a", {',
			'\t\theader: "A",',
			'\t}),',
			'\tcolumnHelper.accessor("b", {}),',
		].join('\n');
		expect(extractExcerpt(entries, 1)?.code).toBe(entries.split('\n').slice(0, 4).join('\n'));
		expect(extractExcerpt('# @Blueprint a\nclass A: ...\nx = 1', 1)?.code).toBe(
			'# @Blueprint a\nclass A: ...',
		);
		expect(extractExcerpt('// @Blueprint a\ni++\nj++', 1)?.code).toBe('// @Blueprint a\ni++');
		expect(extractExcerpt('// @Blueprint a\nrun(); // then =\nnext();', 1)?.code).toBe(
			'// @Blueprint a\nrun(); // then =',
		);
	});

	it('includes the decorators and the declaration they annotate', () => {
		const src = [
			'/**',
			' * @Blueprint controller-cancel',
			' */',
			"@Patch(':id/cancel')",
			'@ApiOperation({',
			"\tsummary: 'Cancel',",
			'})',
			'@Deprecated',
			'// @FollowsBlueprint lifecycle',
			'/* multi-line',
			'   note */',
			'async cancel(',
			'\t@Param() params: IdDto,',
			'): Promise<void> {',
			'\tawait this.service.cancel(params.id);',
			'}',
			'',
			"@Get(':id')",
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(src.split('\n').slice(0, 16).join('\n'));
	});

	it('does not treat a one-line decorated declaration as a decorator', () => {
		const src = '// @Blueprint a\n@Injectable() export class A {}\n@Injectable() export class B {}';
		expect(extractExcerpt(src, 1)?.code).toBe('// @Blueprint a\n@Injectable() export class A {}');
	});

	it('follows a decorated Python function with a multi-line signature', () => {
		const src = [
			'# @Blueprint route',
			'@router.get("/")',
			'def list_users(',
			'    limit: int,',
			'):  # paginated',
			'    return repo.list(limit)',
			'',
			'def other(): ...',
		].join('\n');
		expect(extractExcerpt(src, 1)?.code).toBe(src.split('\n').slice(0, 6).join('\n'));
	});

	it('keeps strings and block comments left open on a balanced line', () => {
		const template = ['// @Blueprint a', 'export const sql = `', 'SELECT 1', '`;', 'x();'].join(
			'\n',
		);
		expect(extractExcerpt(template, 1)?.code).toBe(template.split('\n').slice(0, 4).join('\n'));
		const comment = [
			'// @Blueprint a',
			'export const a = 1; /* note',
			'still note */',
			'x();',
		].join('\n');
		expect(extractExcerpt(comment, 1)?.code).toBe(comment.split('\n').slice(0, 3).join('\n'));
	});

	it('stops at a blank line following the annotation block', () => {
		const src = '// @Blueprint a\n\nexport const a = 1;';
		expect(extractExcerpt(src, 1)?.code).toBe('// @Blueprint a\n');
	});

	it('is not derailed by apostrophes in the JSX text of a .tsx exemplar', () => {
		const src = [
			'// @Blueprint printer-dialog',
			'export function PrinterDialog({ open }: Props) {',
			'	return (',
			'		<Dialog open={open}>',
			"			<DialogTitle>Choix de l'imprimante</DialogTitle>",
			"			<p>Rock 'n roll des années '90 {open && (",
			'				<Badge />',
			'			)}</p>',
			'		</Dialog>',
			'	);',
			'}',
			'',
			'export function Other() {}',
		].join('\n');
		const expected = src.split('\n').slice(0, 11).join('\n');
		expect(extractExcerpt(src, 1, 'src/PrinterDialog.component.tsx')?.code).toBe(expected);
		expect(extractExcerpt(src, 1, 'src/printer.py')?.code).not.toBe(expected);
	});
});

describe('buildSource', () => {
	it('prefixes the repo when provided', () => {
		expect(buildSource('owner/repo', 'src/a.ts:42')).toBe('owner/repo:src/a.ts:42');
	});

	it('omits the repo prefix when absent', () => {
		expect(buildSource(undefined, 'src/a.ts:42')).toBe('src/a.ts:42');
	});

	it('omits the line when the location has none', () => {
		expect(buildSource('owner/repo', 'src/a.ts')).toBe('owner/repo:src/a.ts');
	});
});

describe('buildBlueprintContent', () => {
	it('builds markdown with an excerpt', () => {
		const row = {
			id: 'controller-create',
			name: 'Controller Create',
			usage: 'Use for POST endpoints',
			description: 'Creates a resource',
			globs: 'src/**/*.controller.ts',
			location: 'src/areas/area.controller.ts:42',
		};
		const md = buildBlueprintContent(row, { code: 'export const x = 1;', truncated: false });
		expect(md).toContain('## Context\n\nCreates a resource');
		expect(md).toContain('## Usage\n\nUse for POST endpoints');
		expect(md).toContain('Exemplar: `src/areas/area.controller.ts:42`');
		expect(md).toContain('```typescript\nexport const x = 1;\n```\n');
		expect(md).not.toContain('truncated');
	});

	it('notes a truncated excerpt below its code block', () => {
		const row = {
			id: 'ctrl',
			name: 'Ctrl',
			usage: 'Use for ctrl',
			description: 'Does ctrl',
			globs: '',
			location: 'src/a.ts:1',
		};
		expect(buildBlueprintContent(row, { code: 'x', truncated: true })).toContain(
			`\`\`\`\n\n_Excerpt truncated to its first ${MAX_EXCERPT_LINES} lines — the full declaration is in the exemplar._\n`,
		);
	});

	it('returns undefined for an extension-less or unrecognized extension', () => {
		const row = {
			id: 'ctrl',
			name: 'Ctrl',
			usage: 'Use for ctrl',
			description: 'Does ctrl',
			globs: '',
			location: 'src/a.unknownext',
		};
		const md = buildBlueprintContent(row);
		expect(md).not.toContain('```');
		expect(md).toContain('Exemplar: `src/a.unknownext`');
	});

	it('omits the language tag for unrecognized extensions when an excerpt is present', () => {
		const row = {
			id: 'ctrl',
			name: 'Ctrl',
			usage: 'Use for ctrl',
			description: 'Does ctrl',
			globs: '',
			location: 'src/a.foo:1',
		};
		expect(buildBlueprintContent(row, { code: 'x', truncated: false })).toContain('```\nx');
	});

	it('omits the language tag for paths ending with a dot', () => {
		const row = {
			id: 'ctrl',
			name: 'Ctrl',
			usage: 'Use for ctrl',
			description: 'Does ctrl',
			globs: '',
			location: 'src/a.',
		};
		expect(buildBlueprintContent(row, { code: 'x', truncated: false })).toContain('```\nx');
	});

	it('falls back to a generic description when empty', () => {
		const row = {
			id: 'my-pattern',
			name: 'My Pattern',
			usage: 'Use for things',
			description: '',
			globs: '',
			location: 'src/a.ts',
		};
		expect(buildBlueprintContent(row)).toContain('Pattern `my-pattern` — canonical exemplar');
	});
});

describe('foreignProjects', () => {
	const aquila = { id: 'id-aquila', slug: 'aquila-ap' };
	const lds = { id: 'id-lds', slug: 'lefebvre-dalloz-sig-web' };

	it('treats a project-less blueprint as never foreign', () => {
		expect(foreignProjects([], undefined)).toEqual([]);
		expect(foreignProjects([], 'id-lds')).toEqual([]);
	});

	it('treats a blueprint already in the target project as ours, even when shared', () => {
		expect(foreignProjects([aquila, lds], 'id-lds')).toEqual([]);
	});

	it('names the owning projects when the sync targets another project', () => {
		expect(foreignProjects([aquila], 'id-lds')).toEqual(['aquila-ap']);
	});

	it('names the owning projects when the sync is unscoped', () => {
		expect(foreignProjects([aquila, lds], undefined)).toEqual([
			'aquila-ap',
			'lefebvre-dalloz-sig-web',
		]);
	});
});
