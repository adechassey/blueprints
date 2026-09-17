import { describe, expect, it } from 'vitest';
import {
	buildScaffoldIndex,
	buildScaffoldManifest,
	groupBlueprintsByLayer,
	type StackBlueprint,
	scaffoldFilePath,
} from './stacks.core.js';

function bp(overrides: Partial<StackBlueprint>): StackBlueprint {
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

describe('groupBlueprintsByLayer', () => {
	it('groups blueprints by layer in canonical order', () => {
		const groups = groupBlueprintsByLayer([
			bp({ slug: 'a', layer: 'ui' }),
			bp({ slug: 'b', layer: 'database' }),
			bp({ slug: 'c', layer: 'api' }),
			bp({ slug: 'd', layer: 'ui' }),
		]);

		expect(groups.map((g) => g.layer)).toEqual(['database', 'api', 'ui']);
		expect(groups[2]?.blueprints.map((b) => b.slug)).toEqual(['a', 'd']);
	});

	it('puts unknown layers last, in encounter order', () => {
		const groups = groupBlueprintsByLayer([
			bp({ slug: 'a', layer: 'custom' }),
			bp({ slug: 'b', layer: 'domain' }),
			bp({ slug: 'c', layer: 'other' }),
		]);

		expect(groups.map((g) => g.layer)).toEqual(['domain', 'custom', 'other']);
	});

	it('returns an empty array for no blueprints', () => {
		expect(groupBlueprintsByLayer([])).toEqual([]);
	});
});

describe('scaffoldFilePath', () => {
	it('puts the blueprint under its layer directory', () => {
		expect(scaffoldFilePath({ layer: 'api', slug: 'auth-middleware' })).toBe(
			'blueprints/api/auth-middleware.md',
		);
	});
});

describe('buildScaffoldManifest', () => {
	it('serializes the stack, technologies and layer groups', () => {
		const manifest = JSON.parse(
			buildScaffoldManifest({
				stackSlug: 'theodo-node-react',
				stackName: 'Theodo Node/React',
				technologies: [{ name: 'React', slug: 'react' }],
				blueprints: [bp({ slug: 'login-form', layer: 'ui' })],
			}),
		);
		expect(manifest.stack).toBe('theodo-node-react');
		expect(manifest.name).toBe('Theodo Node/React');
		expect(manifest.technologies).toEqual([{ name: 'React', slug: 'react' }]);
		expect(manifest.layers).toEqual([{ layer: 'ui', blueprints: ['login-form'] }]);
		expect(manifest.generatedAt).toEqual(expect.any(String));
	});
});

describe('buildScaffoldIndex', () => {
	it('renders a markdown index grouped by layer with links', () => {
		const index = buildScaffoldIndex(
			'Theodo Node/React',
			'Reference stack',
			[
				{ name: 'React', slug: 'react' },
				{ name: 'Hono', slug: 'hono' },
			],
			[bp({ slug: 'login-form', name: 'Login Form', layer: 'ui', description: 'A login page' })],
		);

		expect(index).toContain('# Theodo Node/React');
		expect(index).toContain('Reference stack');
		expect(index).toContain('**Technologies:** React, Hono');
		expect(index).toContain('## Ui');
		expect(index).toContain('- [Login Form](./blueprints/ui/login-form.md) — A login page');
	});

	it('omits the description line when null and the heading when absent', () => {
		const index = buildScaffoldIndex(
			'My Stack',
			null,
			[{ name: 'React', slug: 'react' }],
			[bp({ slug: 'no-desc', name: 'No Description' })],
		);
		expect(index).not.toContain(' — ');
		expect(index).toContain('**Technologies:** React');
		expect(index).toContain('- [No Description](./blueprints/domain/no-desc.md)');
	});
});
