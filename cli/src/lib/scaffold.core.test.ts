import { describe, expect, it } from 'vitest';
import {
	blueprintFilePaths,
	buildIndex,
	buildManifest,
	buildScaffoldFiles,
	findSlugCollisions,
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

	it('suffixes blueprints sharing a layer and a slug with their project', () => {
		expect(
			blueprintFilePaths([
				bp({ layer: 'ui', slug: 'form-field', projects: ['lefebvre-dalloz'] }),
				bp({ layer: 'ui', slug: 'form-field', projects: ['zeta', 'aquila'] }),
				bp({ layer: 'ui', slug: 'form-field' }),
				bp({ layer: 'domain', slug: 'form-field', projects: ['aquila'] }),
			]),
		).toEqual([
			'blueprints/ui/form-field.lefebvre-dalloz.md',
			'blueprints/ui/form-field.aquila.md',
			'blueprints/ui/form-field.global.md',
			'blueprints/domain/form-field.md',
		]);
	});
});

describe('findSlugCollisions', () => {
	it('lists each colliding layer and slug with the namespaces involved', () => {
		expect(
			findSlugCollisions([
				bp({ layer: 'ui', slug: 'form-field', projects: ['lefebvre-dalloz'] }),
				bp({ layer: 'ui', slug: 'data-table', projects: ['aquila'] }),
				bp({ layer: 'ui', slug: 'form-field', projects: ['aquila'] }),
			]),
		).toEqual([{ layer: 'ui', slug: 'form-field', namespaces: ['lefebvre-dalloz', 'aquila'] }]);
	});

	it('is empty when every slug is unique within its layer', () => {
		expect(findSlugCollisions([bp({ slug: 'a' }), bp({ slug: 'b' })])).toEqual([]);
	});
});

describe('buildManifest', () => {
	it('serializes the stack, technologies and layer groups', () => {
		const manifest = JSON.parse(
			buildManifest(
				{ slug: 'theodo-node-react', name: 'Theodo Node/React', description: null },
				TECHS,
				[bp({ slug: 'login-form', layer: 'ui' })],
			),
		);
		expect(manifest.stack).toBe('theodo-node-react');
		expect(manifest.name).toBe('Theodo Node/React');
		expect(manifest.technologies).toEqual(TECHS);
		expect(manifest.layers).toEqual([
			{
				layer: 'ui',
				blueprints: [{ slug: 'login-form', projects: [], file: 'blueprints/ui/login-form.md' }],
			},
		]);
		expect(manifest.generatedAt).toEqual(expect.any(String));
	});
});

describe('buildIndex', () => {
	it('renders a markdown index grouped by layer with links', () => {
		const index = buildIndex(
			{ slug: 'stack', name: 'My Stack', description: 'The reference stack' },
			TECHS,
			[bp({ slug: 'login-form', name: 'Login Form', layer: 'ui', description: 'A login page' })],
		);

		expect(index).toContain('# My Stack');
		expect(index).toContain('The reference stack');
		expect(index).toContain('**Technologies:** React, Hono');
		expect(index).toContain('## Ui');
		expect(index).toContain('- [Login Form](./blueprints/ui/login-form.md) — A login page');
	});

	it('omits the description line when null', () => {
		const index = buildIndex({ slug: 'stack', name: 'My Stack', description: null }, TECHS, [bp()]);
		expect(index).not.toContain(' — ');
		expect(index).toContain('**Technologies:** React, Hono');
	});
});

describe('buildScaffoldFiles', () => {
	it('maps every blueprint, the index and the manifest', () => {
		const files = buildScaffoldFiles(
			{ slug: 'stack', name: 'My Stack', description: null },
			TECHS,
			[
				bp({ slug: 'login-form', layer: 'ui', content: '# login' }),
				bp({ slug: 'service-create', layer: 'domain', content: '# service' }),
			],
		);

		expect(files.get('blueprints/ui/login-form.md')).toBe('# login');
		expect(files.get('blueprints/domain/service-create.md')).toBe('# service');
		expect(files.get('index.md')).toContain('# My Stack');
		expect(JSON.parse(files.get('stack.json') ?? '{}').stack).toBe('stack');
		expect(files.size).toBe(4);
	});

	it('keeps both files when two projects publish the same slug in a layer', () => {
		const files = buildScaffoldFiles(
			{ slug: 'stack', name: 'My Stack', description: null },
			TECHS,
			[
				bp({ slug: 'form-field', layer: 'ui', projects: ['aquila'], content: '# aquila' }),
				bp({ slug: 'form-field', layer: 'ui', projects: ['lefebvre-dalloz'], content: '# ld' }),
			],
		);

		expect(files.get('blueprints/ui/form-field.aquila.md')).toBe('# aquila');
		expect(files.get('blueprints/ui/form-field.lefebvre-dalloz.md')).toBe('# ld');
		expect(files.get('index.md')).toContain('(./blueprints/ui/form-field.aquila.md)');
	});
});
