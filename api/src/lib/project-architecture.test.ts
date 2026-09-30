import { projectArchitectureSchema, updateProjectSchema } from '@blueprints/shared';
import { describe, expect, it } from 'vitest';

const webServerShared = {
	zones: [
		{ id: 'web', label: 'Webapp', technologies: ['react'], layerLabels: { api: 'Routes' } },
		{ id: 'server', label: 'Server', hint: 'Node.js', technologies: ['node'] },
		{ id: 'shared', label: 'Shared', shared: true },
	],
	edges: [{ from: 'web', to: 'server', layer: 'api', label: 'HTTP' }],
};

function issues(config: unknown): string[] {
	const result = projectArchitectureSchema.safeParse(config);
	return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('projectArchitectureSchema', () => {
	it('accepts zones resolved by technology with a shared catch-all zone', () => {
		expect(issues(webServerShared)).toEqual([]);
	});

	it('accepts a single catch-all zone', () => {
		expect(issues({ zones: [{ id: 'app', label: 'Application' }] })).toEqual([]);
	});

	it('rejects duplicate zone ids', () => {
		expect(
			issues({
				zones: [
					{ id: 'app', label: 'A', technologies: ['react'] },
					{ id: 'app', label: 'B' },
				],
			}),
		).toEqual(['Duplicate zone id "app"']);
	});

	it('requires exactly one catch-all zone', () => {
		expect(issues({ zones: [{ id: 'web', label: 'Webapp', technologies: ['react'] }] })).toEqual([
			'Exactly one zone must omit "technologies" to catch the remaining blueprints (found 0)',
		]);
		expect(
			issues({
				zones: [
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' },
				],
			}),
		).toEqual([
			'Exactly one zone must omit "technologies" to catch the remaining blueprints (found 2)',
		]);
	});

	it('needs a non-shared zone and at most one shared zone', () => {
		expect(issues({ zones: [{ id: 'shared', label: 'Shared', shared: true }] })).toEqual([
			'At least one zone must not be shared',
		]);
		expect(
			issues({
				zones: [
					{ id: 'web', label: 'Webapp', technologies: ['react'] },
					{ id: 'a', label: 'A', technologies: ['zod'], shared: true },
					{ id: 'b', label: 'B', shared: true },
				],
			}),
		).toEqual(['At most one zone can be shared']);
	});

	it('only draws edges between side-by-side non-shared zones', () => {
		const zones = [
			{ id: 'web', label: 'Webapp', technologies: ['react'] },
			{ id: 'bff', label: 'BFF', technologies: ['hono'] },
			{ id: 'server', label: 'Server' },
			{ id: 'shared', label: 'Shared', technologies: ['zod'], shared: true },
		];
		expect(issues({ zones, edges: [{ from: 'server', to: 'bff', layer: 'api' }] })).toEqual([]);
		expect(issues({ zones, edges: [{ from: 'web', to: 'server', layer: 'api' }] })).toEqual([
			'Edges connect zones side by side: "web" and "server" are not',
		]);
		expect(issues({ zones, edges: [{ from: 'web', to: 'shared', layer: 'api' }] })).toEqual([
			'Edges connect non-shared zones: "shared" is not one',
		]);
		expect(issues({ zones, edges: [{ from: 'mobile', to: 'web', layer: 'ui' }] })).toEqual([
			'Edges connect non-shared zones: "mobile" is not one',
		]);
	});

	it('rejects unknown layers and malformed zone ids', () => {
		expect(
			projectArchitectureSchema.safeParse({
				zones: [{ id: 'App Zone', label: 'App', layerLabels: { service: 'Services' } }],
			}).success,
		).toBe(false);
	});
});

describe('updateProjectSchema', () => {
	it('accepts an architecture config, or null to reset it', () => {
		expect(updateProjectSchema.parse({ architecture: webServerShared }).architecture).toEqual(
			webServerShared,
		);
		expect(updateProjectSchema.parse({ architecture: null }).architecture).toBeNull();
		expect(updateProjectSchema.parse({ name: 'Renamed' }).architecture).toBeUndefined();
	});

	it('rejects an invalid architecture config', () => {
		expect(updateProjectSchema.safeParse({ architecture: { zones: [] } }).success).toBe(false);
	});
});
