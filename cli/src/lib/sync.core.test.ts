import { describe, expect, it } from 'vitest';
import {
	buildBlueprintContent,
	buildSource,
	extractExcerpt,
	foreignProjects,
	inferLayer,
	parseIndexTsv,
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
		['src/**/*.controller.ts', 'controller'],
		['src/**/*.service.ts', 'service'],
		['src/**/*.repository.ts', 'repository'],
		['src/**/*.middleware.ts', 'middleware'],
		['src/**/*.guard.ts', 'guard'],
		['src/**/*.hook.ts', 'hook'],
		['src/hooks/useAuth.ts', 'hook'],
		['src/**/*.tsx', 'component'],
		['src/**/*.jsx', 'component'],
	])('infers layer from glob %s', (glob, expected) => {
		expect(inferLayer(glob)).toBe(expected);
	});

	it('uses only the first glob when several are declared', () => {
		expect(inferLayer('src/**/*.service.ts, src/**/*.controller.ts')).toBe('service');
	});

	it('ignores a leading exclusion glob and falls back', () => {
		expect(inferLayer('!**/*.test.ts, src/**/*.unknown.ts', 'fallback')).toBe('fallback');
	});

	it('returns the fallback when globs are empty', () => {
		expect(inferLayer('')).toBe('pattern');
		expect(inferLayer('', 'unknown')).toBe('unknown');
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
		expect(extractExcerpt(file, 1)).toBe(
			'// @Blueprint controller-create\n// @BlueprintName Create\nexport const x = 1;',
		);
	});

	it('supports block comments and # comments', () => {
		const jsdoc = ['/** @Blueprint ctrl */', ' * more', 'export const a;'].join('\n');
		expect(extractExcerpt(jsdoc, 1)).toBe('/** @Blueprint ctrl */\n * more\nexport const a;');
		const py = ['# @Blueprint ctrl', 'class A: ...', 'x = 1'].join('\n');
		expect(extractExcerpt(py, 1)).toBe('# @Blueprint ctrl\nclass A: ...');
	});

	it('returns undefined for out-of-bounds lines', () => {
		expect(extractExcerpt(file, 0)).toBeUndefined();
		expect(extractExcerpt(file, 99)).toBeUndefined();
		expect(extractExcerpt(file, Number.NaN)).toBeUndefined();
	});

	it('runs to end of file when only comments remain', () => {
		const onlyComments = '// @Blueprint a\n// @BlueprintName A';
		expect(extractExcerpt(onlyComments, 1)).toBe(onlyComments);
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
		const md = buildBlueprintContent(row, 'export const x = 1;');
		expect(md).toContain('## Context\n\nCreates a resource');
		expect(md).toContain('## Usage\n\nUse for POST endpoints');
		expect(md).toContain('Exemplar: `src/areas/area.controller.ts:42`');
		expect(md).toContain('```typescript\nexport const x = 1;\n```');
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
		expect(buildBlueprintContent(row, 'x')).toContain('```\nx');
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
		expect(buildBlueprintContent(row, 'x')).toContain('```\nx');
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
