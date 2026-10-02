import type { ProjectArchitecture } from '@blueprints/shared';
import { describe, expect, it } from 'vitest';
import {
	buildArchitectureMap,
	CROSS_CUTTING,
	defaultArchitecture,
	MAP_WIDTH,
	NODE_HEIGHT,
	parseArchitectureDraft,
	technologySlugs,
	zoneOf,
} from './architecture.core.js';

const bp = (slug: string, layer: string, ...technologies: string[]) => ({
	slug,
	layer,
	technologies: technologies.map((t) => ({ slug: t })),
});

const webServerShared: ProjectArchitecture = {
	zones: [
		{ id: 'web', label: 'Webapp', technologies: ['react'], layerLabels: { api: 'Routes' } },
		{ id: 'server', label: 'Server', technologies: ['node'] },
		{ id: 'shared', label: 'Shared', shared: true },
	],
	edges: [{ from: 'web', to: 'server', layer: 'api', label: 'HTTP' }],
};

const fullStack = [
	bp('page', 'ui', 'react'),
	bp('route', 'api', 'react'),
	bp('endpoint', 'api', 'node'),
	bp('service', 'domain', 'node'),
	bp('repository', 'database', 'node'),
	bp('schema', 'database', 'zod'),
];

describe('defaultArchitecture', () => {
	it('is a single catch-all zone', () => {
		expect(defaultArchitecture('Application')).toEqual({
			zones: [{ id: 'app', label: 'Application' }],
		});
	});
});

describe('zoneOf', () => {
	const zones = webServerShared.zones;

	it('picks the first zone listing one of the technologies', () => {
		expect(zoneOf(bp('a', 'ui', 'zod', 'react'), zones)?.id).toBe('web');
		expect(zoneOf(bp('a', 'ui', 'node', 'react'), zones)?.id).toBe('web');
	});

	it('falls back to the catch-all zone', () => {
		expect(zoneOf(bp('a', 'ui', 'zod'), zones)?.id).toBe('shared');
		expect(zoneOf({ layer: 'ui' }, zones)?.id).toBe('shared');
	});

	it('finds nothing without a catch-all zone', () => {
		expect(zoneOf(bp('a', 'ui'), [{ id: 'web', label: 'Webapp', technologies: ['react'] }])).toBe(
			undefined,
		);
	});
});

describe('buildArchitectureMap', () => {
	it('draws a single centered zone chaining the present layers top-down', () => {
		const map = buildArchitectureMap(
			[bp('repo', 'database'), bp('page', 'ui'), bp('legacy', 'service'), bp('svc', 'domain')],
			defaultArchitecture('Application'),
		);

		expect(map.width).toBe(MAP_WIDTH);
		expect(map.frames).toEqual([
			expect.objectContaining({ id: 'app', count: 3, x: 260, y: 8, width: 440 }),
		]);
		expect(map.nodes.map((n) => [n.id, n.items.map((i) => i.slug), n.label])).toEqual([
			['app:ui', ['page'], undefined],
			['app:domain', ['svc'], undefined],
			['app:database', ['repo'], undefined],
		]);
		// Rows are only the layers present: domain sits right under ui
		const [ui, domain] = map.nodes;
		expect(domain?.y).toBe((ui?.y ?? 0) + 92);
		expect(map.edges).toEqual([
			{ id: 'app:ui>app:domain', kind: 'flow', x1: 480, y1: 68 + NODE_HEIGHT, x2: 480, y2: 157 },
			expect.objectContaining({ id: 'app:domain>app:database', kind: 'flow' }),
		]);
		expect(map.height).toBe(8 + 60 + 2 * 92 + NODE_HEIGHT + 24 + 8);
	});

	it('lays zones side by side with rows aligned, a link between them and the shared band below', () => {
		const map = buildArchitectureMap(fullStack, webServerShared);

		expect(map.frames.map((f) => [f.id, f.count])).toEqual([
			['web', 2],
			['server', 3],
			['shared', 1],
		]);
		const byId = new Map(map.nodes.map((n) => [n.id, n]));
		expect(byId.get('web:api')?.label).toBe('Routes');
		expect(byId.get('server:api')?.label).toBeUndefined();
		expect(byId.get('web:api')?.y).toBe(byId.get('server:api')?.y);
		expect(byId.get('shared:database')?.items.map((i) => i.slug)).toEqual(['schema']);

		const link = map.edges.find((e) => e.kind === 'link');
		const webApi = byId.get('web:api');
		const serverApi = byId.get('server:api');
		expect(link).toEqual({
			id: 'web:api>server:api',
			kind: 'link',
			x1: (webApi?.x ?? 0) + (webApi?.width ?? 0),
			y1: (webApi?.y ?? 0) + NODE_HEIGHT / 2,
			x2: (serverApi?.x ?? 0) - 3,
			y2: (webApi?.y ?? 0) + NODE_HEIGHT / 2,
			label: 'HTTP',
		});

		const [web, server, shared] = map.frames;
		expect(map.edges.filter((e) => e.kind === 'import')).toEqual([
			{
				id: 'web>shared',
				kind: 'import',
				x1: (web?.x ?? 0) + (web?.width ?? 0) / 2,
				y1: (web?.y ?? 0) + (web?.height ?? 0),
				x2: (web?.x ?? 0) + (web?.width ?? 0) / 2,
				y2: (shared?.y ?? 0) - 3,
			},
			expect.objectContaining({ id: 'server>shared', kind: 'import' }),
		]);
		expect(shared?.y).toBe((server?.y ?? 0) + (server?.height ?? 0) + 76);
		expect(shared).toEqual(expect.objectContaining({ x: 24, width: MAP_WIDTH - 48 }));
	});

	it('draws a link leftward when it goes from a right zone to a left one', () => {
		const map = buildArchitectureMap(fullStack, {
			...webServerShared,
			edges: [{ from: 'server', to: 'web', layer: 'api' }],
		});
		const link = map.edges.find((e) => e.kind === 'link');
		const webApi = map.nodes.find((n) => n.id === 'web:api');
		const serverApi = map.nodes.find((n) => n.id === 'server:api');
		expect(link?.x1).toBe(serverApi?.x);
		expect(link?.x2).toBe((webApi?.x ?? 0) + (webApi?.width ?? 0) + 3);
		expect(link?.label).toBeUndefined();
	});

	it('skips links whose layer is missing in either zone', () => {
		const map = buildArchitectureMap(fullStack, {
			...webServerShared,
			edges: [{ from: 'web', to: 'server', layer: 'ui' }],
		});
		expect(map.edges.some((e) => e.kind === 'link')).toBe(false);
	});

	it('skips empty zones', () => {
		const map = buildArchitectureMap([bp('endpoint', 'api', 'node')], webServerShared);
		expect(map.frames.map((f) => f.id)).toEqual(['server']);
		expect(map.edges).toEqual([]);
	});

	it('draws a shared zone alone at the top when no other zone has blueprints', () => {
		const map = buildArchitectureMap([bp('schema', 'database', 'zod')], webServerShared);
		expect(map.frames).toEqual([expect.objectContaining({ id: 'shared', y: 8 })]);
		expect(map.edges).toEqual([]);
	});

	it('gathers cross-cutting layers from every zone in a band under the zones', () => {
		const map = buildArchitectureMap(
			[
				...fullStack,
				bp('e2e', 'testing', 'react'),
				bp('ci', 'infra', 'node'),
				bp('lint', 'tooling'),
			],
			webServerShared,
		);
		const shared = map.frames.find((f) => f.id === 'shared');
		const band = map.frames.find((f) => f.id === CROSS_CUTTING);
		expect(band).toEqual(
			expect.objectContaining({
				count: 3,
				y: (shared?.y ?? 0) + (shared?.height ?? 0) + 32,
			}),
		);
		expect(band?.zone).toBeUndefined();
		expect(map.nodes.filter((n) => n.frameId === CROSS_CUTTING).map((n) => n.layer)).toEqual([
			'infra',
			'testing',
			'tooling',
		]);
	});

	it('draws the cross-cutting band alone when nothing else is present', () => {
		const map = buildArchitectureMap([bp('ci', 'infra')], defaultArchitecture('Application'));
		expect(map.frames).toEqual([expect.objectContaining({ id: CROSS_CUTTING, y: 8 })]);
		expect(map.nodes).toEqual([
			expect.objectContaining({
				id: `${CROSS_CUTTING}:infra`,
				frameId: CROSS_CUTTING,
				width: 280,
				x: (MAP_WIDTH - 280) / 2,
			}),
		]);
	});

	it('drops blueprints no zone catches', () => {
		const map = buildArchitectureMap([bp('page', 'ui', 'vue')], {
			zones: [{ id: 'web', label: 'Webapp', technologies: ['react'] }],
		});
		expect(map.frames).toEqual([]);
		expect(map.height).toBe(16);
	});
});

describe('parseArchitectureDraft', () => {
	it('treats blank text as the default map', () => {
		expect(parseArchitectureDraft('  \n')).toEqual({ ok: true, config: null });
	});

	it('parses a valid config', () => {
		expect(parseArchitectureDraft(JSON.stringify(webServerShared))).toEqual({
			ok: true,
			config: webServerShared,
		});
	});

	it('reports malformed JSON', () => {
		const result = parseArchitectureDraft('{ zones: ');
		expect(result.ok).toBe(false);
		expect(result.ok === false && result.issues).toHaveLength(1);
	});

	it('reports schema issues with their path', () => {
		expect(
			parseArchitectureDraft(
				JSON.stringify({ zones: [{ id: 'web', label: 'W', technologies: ['react'] }] }),
			),
		).toEqual({
			ok: false,
			issues: [
				'zones: Exactly one zone must omit "technologies" to catch the remaining blueprints (found 0)',
			],
		});
		// A root-level issue has no path to prefix
		expect(parseArchitectureDraft('42')).toEqual({
			ok: false,
			issues: ['Invalid input: expected object, received number'],
		});
	});
});

describe('technologySlugs', () => {
	it('lists the distinct technologies of the blueprints, sorted', () => {
		expect(
			technologySlugs([
				bp('a', 'ui', 'react', 'vite'),
				bp('b', 'api', 'node', 'react'),
				{ layer: 'ui' },
			]),
		).toEqual(['node', 'react', 'vite']);
	});
});
