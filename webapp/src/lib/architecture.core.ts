/**
 * Pure architecture map helpers: zone resolution, layout and config parsing.
 * 100% test coverage required.
 */
import {
	type ArchitectureZone,
	type BlueprintLayer,
	type ProjectArchitecture,
	projectArchitectureSchema,
} from '@blueprints/shared';

/** Drawn inside each zone, top-down: what users touch first, storage last. */
const FLOW_LAYERS: readonly BlueprintLayer[] = ['ui', 'state', 'api', 'domain', 'database'];
/** Drawn in their own band under the zones, whatever zone their blueprints fall in. */
const CROSS_CUTTING_LAYERS: readonly BlueprintLayer[] = ['infra', 'testing', 'tooling'];

/** Frame id of the cross-cutting band: the underscore keeps it out of the zone id space. */
export const CROSS_CUTTING = '_cross-cutting';

// Layout, in SVG user units
export const MAP_WIDTH = 960;
export const NODE_HEIGHT = 52;
const TOP = 8;
const PAD = 24;
const HEADER = 60;
const ROW_HEIGHT = 92;
const GAP_X = 128;
const MAX_ZONE_WIDTH = 440;
const MAX_BAND_NODE_WIDTH = 280;
/** Room for the import arrows above the shared band. */
const IMPORT_GAP = 76;
const SECTION_GAP = 32;
/** Arrowhead clearance: an arrow stops short of the node it points at. */
const ARROW_GAP = 3;

interface MappableBlueprint {
	layer: string;
	technologies?: { slug: string }[];
}

export interface MapFrame {
	/** Zone id, or `CROSS_CUTTING` for the cross-cutting band. */
	id: string;
	zone?: ArchitectureZone;
	count: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface MapNode<T> {
	/** `<frame id>:<layer>` */
	id: string;
	frameId: string;
	layer: BlueprintLayer;
	/** The zone's display name for this layer, when the config renames it. */
	label?: string;
	items: T[];
	x: number;
	y: number;
	width: number;
}

export interface MapEdge {
	id: string;
	/** flow: layer to layer inside a zone; link: a configured edge between zones; import: a zone importing the shared zone. */
	kind: 'flow' | 'link' | 'import';
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	label?: string;
}

export interface ArchitectureMap<T> {
	width: number;
	height: number;
	frames: MapFrame[];
	nodes: MapNode<T>[];
	edges: MapEdge[];
}

/** The map of a project without a config: one zone holding every blueprint. */
export function defaultArchitecture(label: string): ProjectArchitecture {
	return { zones: [{ id: 'app', label }] };
}

/** The first zone listing one of the blueprint's technologies, else the catch-all zone. */
export function zoneOf(
	blueprint: MappableBlueprint,
	zones: ArchitectureZone[],
): ArchitectureZone | undefined {
	const slugs = new Set(blueprint.technologies?.map((t) => t.slug));
	return (
		zones.find((zone) => zone.technologies?.some((slug) => slugs.has(slug))) ??
		zones.find((zone) => !zone.technologies)
	);
}

const presentLayers = (layers: readonly BlueprintLayer[], items: MappableBlueprint[]) =>
	layers.filter((layer) => items.some((item) => item.layer === layer));

/**
 * Lays out a project's architecture map: non-shared zones side by side with
 * their layers top-down (rows aligned across zones), the shared zone as a band
 * underneath, then a band for cross-cutting layers. Empty zones and layers are
 * skipped; blueprints with an unknown layer are dropped.
 */
export function buildArchitectureMap<T extends MappableBlueprint>(
	blueprints: T[],
	config: ProjectArchitecture,
): ArchitectureMap<T> {
	const byZone = new Map<string, T[]>(config.zones.map((zone) => [zone.id, []]));
	const crossCutting: T[] = [];
	for (const blueprint of blueprints) {
		const layer = blueprint.layer as BlueprintLayer;
		const zone = zoneOf(blueprint, config.zones);
		if (CROSS_CUTTING_LAYERS.includes(layer)) crossCutting.push(blueprint);
		else if (FLOW_LAYERS.includes(layer) && zone) (byZone.get(zone.id) as T[]).push(blueprint);
	}
	const itemsOf = (zone: ArchitectureZone) => byZone.get(zone.id) as T[];

	const frames: MapFrame[] = [];
	const nodes: MapNode<T>[] = [];
	const edges: MapEdge[] = [];
	const node = (
		frameId: string,
		zone: ArchitectureZone | undefined,
		layer: BlueprintLayer,
		items: T[],
		x: number,
		y: number,
		width: number,
	): MapNode<T> => ({
		id: `${frameId}:${layer}`,
		frameId,
		layer,
		label: zone?.layerLabels?.[layer],
		items: items.filter((item) => item.layer === layer),
		x,
		y,
		width,
	});
	const band = (
		id: string,
		zone: ArchitectureZone | undefined,
		items: T[],
		layers: readonly BlueprintLayer[],
		top: number,
	) => {
		const present = presentLayers(layers, items);
		const width = Math.min(
			MAX_BAND_NODE_WIDTH,
			(MAP_WIDTH - 4 * PAD - (present.length - 1) * PAD) / present.length,
		);
		const left = (MAP_WIDTH - (present.length * width + (present.length - 1) * PAD)) / 2;
		const height = HEADER + NODE_HEIGHT + PAD;
		frames.push({
			id,
			zone,
			count: items.length,
			x: PAD,
			y: top,
			width: MAP_WIDTH - 2 * PAD,
			height,
		});
		present.forEach((layer, k) => {
			nodes.push(node(id, zone, layer, items, left + k * (width + PAD), top + HEADER, width));
		});
		return height;
	};

	let y = TOP;

	const columns = config.zones.filter((zone) => !zone.shared && itemsOf(zone).length > 0);
	const columnFrames: MapFrame[] = [];
	if (columns.length > 0) {
		const rows = FLOW_LAYERS.filter((layer) =>
			columns.some((zone) => itemsOf(zone).some((item) => item.layer === layer)),
		);
		const width = Math.min(
			MAX_ZONE_WIDTH,
			(MAP_WIDTH - 2 * PAD - (columns.length - 1) * GAP_X) / columns.length,
		);
		const left = (MAP_WIDTH - (columns.length * width + (columns.length - 1) * GAP_X)) / 2;
		const height = HEADER + (rows.length - 1) * ROW_HEIGHT + NODE_HEIGHT + PAD;

		columns.forEach((zone, i) => {
			const x = left + i * (width + GAP_X);
			const items = itemsOf(zone);
			const frame = { id: zone.id, zone, count: items.length, x, y, width, height };
			columnFrames.push(frame);
			frames.push(frame);

			const chain = presentLayers(rows, items).map((layer) =>
				node(
					zone.id,
					zone,
					layer,
					items,
					x + PAD,
					y + HEADER + rows.indexOf(layer) * ROW_HEIGHT,
					width - 2 * PAD,
				),
			);
			chain.slice(1).forEach((to, k) => {
				const from = chain[k] as MapNode<T>;
				const cx = from.x + from.width / 2;
				edges.push({
					id: `${from.id}>${to.id}`,
					kind: 'flow',
					x1: cx,
					y1: from.y + NODE_HEIGHT,
					x2: cx,
					y2: to.y - ARROW_GAP,
				});
			});
			nodes.push(...chain);
		});

		for (const edge of config.edges ?? []) {
			const from = nodes.find((n) => n.id === `${edge.from}:${edge.layer}`);
			const to = nodes.find((n) => n.id === `${edge.to}:${edge.layer}`);
			if (!from || !to) continue;
			const rightward = from.x < to.x;
			const mid = from.y + NODE_HEIGHT / 2;
			edges.push({
				id: `${from.id}>${to.id}`,
				kind: 'link',
				x1: rightward ? from.x + from.width : from.x,
				y1: mid,
				x2: rightward ? to.x - ARROW_GAP : to.x + to.width + ARROW_GAP,
				y2: mid,
				label: edge.label,
			});
		}
		y += height;
	}

	const shared = config.zones.find((zone) => zone.shared && itemsOf(zone).length > 0);
	if (shared) {
		if (columnFrames.length > 0) y += IMPORT_GAP;
		for (const frame of columnFrames) {
			const cx = frame.x + frame.width / 2;
			edges.push({
				id: `${frame.id}>${shared.id}`,
				kind: 'import',
				x1: cx,
				y1: frame.y + frame.height,
				x2: cx,
				y2: y - ARROW_GAP,
			});
		}
		y += band(shared.id, shared, itemsOf(shared), FLOW_LAYERS, y);
	}

	if (crossCutting.length > 0) {
		if (frames.length > 0) y += SECTION_GAP;
		y += band(CROSS_CUTTING, undefined, crossCutting, CROSS_CUTTING_LAYERS, y);
	}

	return { width: MAP_WIDTH, height: y + TOP, frames, nodes, edges };
}

type DraftResult =
	| { ok: true; config: ProjectArchitecture | null }
	| { ok: false; issues: string[] };

/** Parses the config editor's JSON. Blank text stands for the default map (null). */
export function parseArchitectureDraft(text: string): DraftResult {
	if (!text.trim()) return { ok: true, config: null };
	let json: unknown;
	try {
		json = JSON.parse(text);
	} catch (error) {
		return { ok: false, issues: [(error as SyntaxError).message] };
	}
	const result = projectArchitectureSchema.safeParse(json);
	if (result.success) return { ok: true, config: result.data };
	return {
		ok: false,
		issues: result.error.issues.map((issue) =>
			issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
		),
	};
}

/** Technology slugs used by a project's blueprints, sorted: what a zone can match on. */
export function technologySlugs(blueprints: MappableBlueprint[]): string[] {
	return [...new Set(blueprints.flatMap((b) => b.technologies?.map((t) => t.slug) ?? []))].sort();
}
