import { describe, expect, it } from 'vitest';
import {
	blueprintFilePaths,
	buildIndex,
	buildManifest,
	buildScaffoldFiles,
	groupByLayer,
	type ScaffoldBlueprint,
} from './scaffold.core.js';

function bp(overrides: Partial<ScaffoldBlueprint> = {}): ScaffoldBlueprint {
	return {
		slug: 'test',
		name: 'Test',
		layer: 'domain',
		description: null,
		technologies: [],
		content: '# content',
		...overrides,
	};
}

const TECHS = [
	{ name: 'React', slug: 'react' },
	{ name: 'Hono', slug: 'hono' },
];

describe('groupByLayer', () => {
	it('groups blueprints by layer in canonical order', () => {
		const groups = groupByLayer([
			bp({ slug: 'a', layer: 'ui' }),
			bp({ slug: 'b', layer: 'database' }),
			bp({ slug: 'c', layer: 'api' }),
			bp({ slug: 'd', layer: 'ui' }),
		]);

		expect(groups.map((g) => g.layer)).toEqual(['database', 'api', 'ui']);
		expect(groups[2]?.blueprints.map((b) => b.slug)).toEqual(['a', 'd']);
	});

	it('puts unknown layers last, in encounter order', () => {
		const groups = groupByLayer([
			bp({ slug: 'a', layer: 'custom' }),
			bp({ slug: 'b', layer: 'domain' }),
			bp({ slug: 'c', layer: 'other' }),
		]);

		expect(groups.map((g) => g.layer)).toEqual(['domain', 'custom', 'other']);
	});

	it('returns an empty array for no blueprints', () => {
		expect(groupByLayer([])).toEqual([]);
	});
});

describe('blueprintFilePaths', () => {
	it('puts each blueprint under its layer directory', () => {
		expect(blueprintFilePaths([bp({ layer: 'api', slug: 'auth-middleware' })])).toEqual([
			'blueprints/api/auth-middleware.md',
		]);
	});

	it('never collides: slugs are unique within the scaffolded project', () => {
		expect(
			blueprintFilePaths([bp({ layer: 'ui', slug: 'form-field' }), bp({ slug: 'form-field' })]),
		).toEqual(['blueprints/ui/form-field.md', 'blueprints/domain/form-field.md']);
	});
});

describe('buildManifest', () => {
	it('serializes the project, technologies and layer groups', () => {
		const manifest = JSON.parse(
			buildManifest({ slug: 'acme', name: 'Acme', description: null }, TECHS, [
				bp({ slug: 'login-form', layer: 'ui' }),
			]),
		);
		expect(manifest.project).toBe('acme');
		expect(manifest.name).toBe('Acme');
		expect(manifest.technologies).toEqual(TECHS);
		expect(manifest.layers).toEqual([
			{
				layer: 'ui',
				blueprints: [{ slug: 'login-form', file: 'blueprints/ui/login-form.md' }],
			},
		]);
		expect(manifest.generatedAt).toEqual(expect.any(String));
	});
});

describe('buildIndex', () => {
	it('renders a markdown index grouped by layer with links', () => {
		const index = buildIndex(
			{ slug: 'acme', name: 'Acme', description: 'The reference project' },
			TECHS,
			[bp({ slug: 'login-form', name: 'Login Form', layer: 'ui', description: 'A login page' })],
		);

		expect(index).toContain('# Acme');
		expect(index).toContain('The reference project');
		expect(index).toContain('**Technologies:** React, Hono');
		expect(index).toContain('## Ui');
		expect(index).toContain('- [Login Form](./blueprints/ui/login-form.md) — A login page');
	});

	it('omits the description line when null', () => {
		const index = buildIndex({ slug: 'acme', name: 'Acme', description: null }, TECHS, [bp()]);
		expect(index).not.toContain(' — ');
		expect(index).toContain('**Technologies:** React, Hono');
	});
});

describe('buildScaffoldFiles', () => {
	it('maps every blueprint, the index and the manifest', () => {
		const files = buildScaffoldFiles({ slug: 'acme', name: 'Acme', description: null }, TECHS, [
			bp({ slug: 'login-form', layer: 'ui', content: '# login' }),
			bp({ slug: 'service-create', layer: 'domain', content: '# service' }),
		]);

		expect(files.get('blueprints/ui/login-form.md')).toBe('# login');
		expect(files.get('blueprints/domain/service-create.md')).toBe('# service');
		expect(files.get('index.md')).toContain('# Acme');
		expect(JSON.parse(files.get('scaffold.json') ?? '{}').project).toBe('acme');
		expect(files.size).toBe(4);
	});
});
