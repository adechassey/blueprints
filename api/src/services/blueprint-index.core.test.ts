import { describe, expect, it } from 'vitest';
import { generateBlueprintIndex, type IndexBlueprint } from './blueprint-index.core.js';

function bp(overrides: Partial<IndexBlueprint>): IndexBlueprint {
	return {
		slug: 'test',
		name: 'Test',
		technologies: [],
		layer: 'domain',
		description: null,
		usage: null,
		...overrides,
	};
}

describe('generateBlueprintIndex', () => {
	it('generates empty index', () => {
		const result = generateBlueprintIndex('My Project', []);
		expect(result).toContain('# Blueprint Index — My Project');
		expect(result).toContain('No blueprints in this project.');
	});

	it('generates index with blueprints grouped by layer', () => {
		const blueprints: IndexBlueprint[] = [
			{
				slug: 'auth-middleware',
				name: 'Auth Middleware',
				technologies: ['hono'],
				layer: 'api',
				description: 'JWT auth',
				usage: 'Use for protected routes',
			},
			{
				slug: 'login-form',
				name: 'Login Form',
				technologies: ['react'],
				layer: 'ui',
				description: 'Login page',
				usage: 'Use for auth pages',
			},
			{
				slug: 'user-repository',
				name: 'User Repository',
				technologies: ['drizzle'],
				layer: 'database',
				description: 'User model',
				usage: null,
			},
		];

		const result = generateBlueprintIndex('Test Project', blueprints);

		expect(result).toContain('# Blueprint Index — Test Project');
		expect(result).toContain('## Database');
		expect(result).toContain('## Api');
		expect(result).toContain('## Ui');
		expect(result).toContain(
			'| auth-middleware | hono | Auth Middleware | Use for protected routes | JWT auth |',
		);
		expect(result).toContain(
			'| login-form | react | Login Form | Use for auth pages | Login page |',
		);
		expect(result).toContain('| user-repository | drizzle | User Repository |  | User model |');
	});

	it('sorts layers in canonical order', () => {
		const blueprints: IndexBlueprint[] = [
			bp({ slug: 'b', name: 'B', layer: 'ui' }),
			bp({ slug: 'a', name: 'A', layer: 'database' }),
			bp({ slug: 'c', name: 'C', layer: 'api' }),
		];

		const result = generateBlueprintIndex('P', blueprints);
		const databaseIdx = result.indexOf('## Database');
		const apiIdx = result.indexOf('## Api');
		const uiIdx = result.indexOf('## Ui');

		expect(databaseIdx).toBeLessThan(apiIdx);
		expect(apiIdx).toBeLessThan(uiIdx);
	});

	it('sorts blueprints within a layer by name', () => {
		const blueprints: IndexBlueprint[] = [
			bp({ slug: 'z-service', name: 'Z Service', layer: 'domain' }),
			bp({ slug: 'a-handler', name: 'A Handler', layer: 'domain' }),
			bp({ slug: 'b-handler', name: 'B Handler', layer: 'domain' }),
		];

		const result = generateBlueprintIndex('P', blueprints);
		const aHandlerIdx = result.indexOf('a-handler');
		const bHandlerIdx = result.indexOf('b-handler');
		const zServiceIdx = result.indexOf('z-service');

		expect(aHandlerIdx).toBeLessThan(bHandlerIdx);
		expect(bHandlerIdx).toBeLessThan(zServiceIdx);
	});

	it('joins multiple technologies with commas', () => {
		const result = generateBlueprintIndex('P', [
			bp({ slug: 'test', name: 'Test', technologies: ['react', 'drizzle'] }),
		]);
		expect(result).toContain('| test | react, drizzle | Test |  |  |');
	});

	it('escapes pipe characters in description and usage', () => {
		const blueprints: IndexBlueprint[] = [
			bp({
				slug: 'test',
				name: 'Test',
				layer: 'x',
				description: 'has | pipe',
				usage: 'use | this',
			}),
		];

		const result = generateBlueprintIndex('P', blueprints);
		expect(result).toContain('has \\| pipe');
		expect(result).toContain('use \\| this');
	});

	it('handles null description and usage', () => {
		const result = generateBlueprintIndex('P', [bp({ slug: 'test', name: 'Test' })]);
		expect(result).toContain('| test |  | Test |  |  |');
	});

	it('puts unknown layers after known ones', () => {
		const blueprints: IndexBlueprint[] = [
			bp({ slug: 'a', name: 'A', layer: 'custom' }),
			bp({ slug: 'b', name: 'B', layer: 'domain' }),
		];

		const result = generateBlueprintIndex('P', blueprints);
		const domainIdx = result.indexOf('## Domain');
		const customIdx = result.indexOf('## Custom');

		expect(domainIdx).toBeLessThan(customIdx);
	});

	it('replaces newlines in description with spaces', () => {
		const blueprints: IndexBlueprint[] = [bp({ description: 'line1\nline2' })];

		const result = generateBlueprintIndex('P', blueprints);
		expect(result).toContain('line1 line2');
		expect(result).not.toContain('line1\nline2');
	});
});
