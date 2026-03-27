import { describe, expect, it } from 'vitest';
import { generateBlueprintIndex, type IndexBlueprint } from './blueprint-index.core.js';

describe('generateBlueprintIndex', () => {
	it('generates empty index', () => {
		const result = generateBlueprintIndex('My Project', []);
		expect(result).toContain('# Blueprint Index — My Project');
		expect(result).toContain('No blueprints in this project.');
	});

	it('generates index with blueprints grouped by stack', () => {
		const blueprints: IndexBlueprint[] = [
			{
				slug: 'auth-middleware',
				name: 'Auth Middleware',
				stack: 'server',
				layer: 'middleware',
				description: 'JWT auth',
				usage: 'Use for protected routes',
			},
			{
				slug: 'login-form',
				name: 'Login Form',
				stack: 'webapp',
				layer: 'page',
				description: 'Login page',
				usage: 'Use for auth pages',
			},
			{
				slug: 'user-schema',
				name: 'User Schema',
				stack: 'shared',
				layer: 'schema',
				description: 'User model',
				usage: null,
			},
		];

		const result = generateBlueprintIndex('Test Project', blueprints);

		expect(result).toContain('# Blueprint Index — Test Project');
		expect(result).toContain('## Server');
		expect(result).toContain('## Webapp');
		expect(result).toContain('## Shared');
		expect(result).toContain(
			'| auth-middleware | middleware | Auth Middleware | Use for protected routes | JWT auth |',
		);
		expect(result).toContain(
			'| login-form | page | Login Form | Use for auth pages | Login page |',
		);
		expect(result).toContain('| user-schema | schema | User Schema |  | User model |');
	});

	it('sorts stacks in canonical order (server, webapp, shared, fullstack)', () => {
		const blueprints: IndexBlueprint[] = [
			{ slug: 'b', name: 'B', stack: 'shared', layer: 'x', description: null, usage: null },
			{ slug: 'a', name: 'A', stack: 'server', layer: 'x', description: null, usage: null },
			{ slug: 'c', name: 'C', stack: 'webapp', layer: 'x', description: null, usage: null },
		];

		const result = generateBlueprintIndex('P', blueprints);
		const serverIdx = result.indexOf('## Server');
		const webappIdx = result.indexOf('## Webapp');
		const sharedIdx = result.indexOf('## Shared');

		expect(serverIdx).toBeLessThan(webappIdx);
		expect(webappIdx).toBeLessThan(sharedIdx);
	});

	it('sorts blueprints within a stack by layer then name', () => {
		const blueprints: IndexBlueprint[] = [
			{
				slug: 'z-service',
				name: 'Z Service',
				stack: 'server',
				layer: 'service',
				description: null,
				usage: null,
			},
			{
				slug: 'a-controller',
				name: 'A Controller',
				stack: 'server',
				layer: 'controller',
				description: null,
				usage: null,
			},
			{
				slug: 'b-service',
				name: 'B Service',
				stack: 'server',
				layer: 'service',
				description: null,
				usage: null,
			},
		];

		const result = generateBlueprintIndex('P', blueprints);
		const controllerIdx = result.indexOf('a-controller');
		const bServiceIdx = result.indexOf('b-service');
		const zServiceIdx = result.indexOf('z-service');

		expect(controllerIdx).toBeLessThan(bServiceIdx);
		expect(bServiceIdx).toBeLessThan(zServiceIdx);
	});

	it('escapes pipe characters in description and usage', () => {
		const blueprints: IndexBlueprint[] = [
			{
				slug: 'test',
				name: 'Test',
				stack: 'server',
				layer: 'x',
				description: 'has | pipe',
				usage: 'use | this',
			},
		];

		const result = generateBlueprintIndex('P', blueprints);
		expect(result).toContain('has \\| pipe');
		expect(result).toContain('use \\| this');
	});

	it('handles null description and usage', () => {
		const blueprints: IndexBlueprint[] = [
			{ slug: 'test', name: 'Test', stack: 'server', layer: 'x', description: null, usage: null },
		];

		const result = generateBlueprintIndex('P', blueprints);
		expect(result).toContain('| test | x | Test |  |  |');
	});

	it('puts unknown stacks after known ones', () => {
		const blueprints: IndexBlueprint[] = [
			{ slug: 'a', name: 'A', stack: 'custom', layer: 'x', description: null, usage: null },
			{ slug: 'b', name: 'B', stack: 'server', layer: 'x', description: null, usage: null },
		];

		const result = generateBlueprintIndex('P', blueprints);
		const serverIdx = result.indexOf('## Server');
		const customIdx = result.indexOf('## Custom');

		expect(serverIdx).toBeLessThan(customIdx);
	});

	it('replaces newlines in description with spaces', () => {
		const blueprints: IndexBlueprint[] = [
			{
				slug: 'test',
				name: 'Test',
				stack: 'server',
				layer: 'x',
				description: 'line1\nline2',
				usage: null,
			},
		];

		const result = generateBlueprintIndex('P', blueprints);
		expect(result).toContain('line1 line2');
		expect(result).not.toContain('line1\nline2');
	});
});
