import type { ProjectArchitecture } from '@blueprints/shared';
import { useId, useState } from 'react';
import {
	buildArchitectureMap,
	defaultArchitecture,
	type MapEdge,
	type MapFrame,
	type MapNode,
	NODE_HEIGHT,
} from '../lib/architecture.core.js';
import { LAYER_META } from '../lib/layers.js';
import { cn } from '../lib/utils.js';
import * as m from '../paraglide/messages.js';
import { CompactBlueprintList } from './BlueprintList.js';
import { LAYER_ICON_COLOR, LayerOption } from './LayerBadge.js';

type Blueprints = React.ComponentProps<typeof CompactBlueprintList>['blueprints'];
type Node = MapNode<Blueprints[number]>;

const PAD = 24;

/**
 * A project's architecture map: its zones with their layers and blueprint
 * counts. With `drillDown`, selecting a layer lists its blueprints under the map.
 */
export function ArchitectureMap({
	blueprints,
	architecture,
	drillDown = true,
}: {
	blueprints: Blueprints;
	architecture: ProjectArchitecture | null;
	drillDown?: boolean;
}) {
	const titleId = useId();
	const arrowId = useId();
	const map = buildArchitectureMap(
		blueprints,
		architecture ?? defaultArchitecture(m.architecture_default_zone()),
	);
	const [selectedId, setSelectedId] = useState<string>();
	const selected = map.nodes.find((node) => node.id === selectedId) ?? map.nodes[0];
	const selectedFrame = map.frames.find((frame) => frame.id === selected?.frameId);

	return (
		<div className="space-y-6">
			<div className="overflow-x-auto rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-3 shadow-rest">
				<svg
					viewBox={`0 0 ${map.width} ${map.height}`}
					className="w-full min-w-[44rem]"
					aria-labelledby={titleId}
				>
					<title id={titleId}>{m.architecture_map_title()}</title>
					<defs>
						<marker
							id={arrowId}
							viewBox="0 0 10 10"
							refX="9"
							refY="5"
							markerWidth="7"
							markerHeight="7"
							orient="auto-start-reverse"
						>
							<path d="M0,0 L10,5 L0,10 z" className="fill-outline" />
						</marker>
					</defs>
					{map.frames.map((frame) => (
						<Frame key={frame.id} frame={frame} />
					))}
					{map.edges.map((edge) => (
						<Edge key={edge.id} edge={edge} marker={`url(#${arrowId})`} />
					))}
					{map.nodes.map((node) =>
						drillDown ? (
							<LayerNode
								key={node.id}
								node={node}
								selected={node.id === selected?.id}
								onSelect={() => setSelectedId(node.id)}
							/>
						) : (
							<LayerNode key={node.id} node={node} />
						),
					)}
				</svg>
			</div>

			{drillDown && selected && (
				<section className="space-y-3">
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-outline-variant/50 pb-2">
						<h3 className="flex flex-wrap items-center gap-2 font-headline text-lg font-bold">
							<span>{selectedFrame?.zone?.label ?? m.architecture_cross_cutting()}</span>
							<span className="text-outline">›</span>
							<LayerOption layer={selected.layer} />
							{selected.label && (
								<span className="font-medium text-on-surface-variant">— {selected.label}</span>
							)}
							<span className="text-sm font-medium text-outline">{selected.items.length}</span>
						</h3>
						<p className="text-sm text-on-surface-variant">
							{LAYER_META[selected.layer].description()}
						</p>
					</div>
					<CompactBlueprintList blueprints={selected.items} />
				</section>
			)}
		</div>
	);
}

function Frame({ frame }: { frame: MapFrame }) {
	const hint = [frame.zone?.hint, frame.count].filter((part) => part !== undefined).join(' · ');
	return (
		<g>
			<rect
				x={frame.x}
				y={frame.y}
				width={frame.width}
				height={frame.height}
				rx={20}
				className="fill-surface-container-low stroke-outline-variant/60"
				strokeWidth={1}
			/>
			<text
				x={frame.x + PAD}
				y={frame.y + 36}
				className="fill-on-surface font-headline text-[18px] font-black"
			>
				{frame.zone?.label ?? m.architecture_cross_cutting()}
			</text>
			<text
				x={frame.x + frame.width - PAD}
				y={frame.y + 36}
				textAnchor="end"
				className="fill-outline text-[12px]"
			>
				{hint}
			</text>
		</g>
	);
}

function Edge({ edge, marker }: { edge: MapEdge; marker: string }) {
	return (
		<g>
			<line
				x1={edge.x1}
				y1={edge.y1}
				x2={edge.x2}
				y2={edge.y2}
				className="stroke-outline"
				strokeWidth={1.5}
				strokeDasharray={edge.kind === 'import' ? '5 5' : undefined}
				markerEnd={marker}
			/>
			{edge.kind === 'link' && edge.label && (
				<text
					x={(edge.x1 + edge.x2) / 2}
					y={edge.y1 - 8}
					textAnchor="middle"
					className="fill-outline text-[11px] font-bold tracking-wider"
				>
					{edge.label}
				</text>
			)}
			{edge.kind === 'import' && (
				<text
					x={edge.x1 + 8}
					y={(edge.y1 + edge.y2) / 2 + 4}
					className="fill-outline text-[11px] font-semibold"
				>
					{m.architecture_imports()}
				</text>
			)}
		</g>
	);
}

function LayerNode({
	node,
	selected = false,
	onSelect,
}: {
	node: Node;
	selected?: boolean;
	onSelect?: () => void;
}) {
	const Icon = LAYER_META[node.layer].icon;
	const layerLabel = LAYER_META[node.layer].label();
	const shape = (
		<>
			<rect
				x={node.x}
				y={node.y}
				width={node.width}
				height={NODE_HEIGHT}
				rx={12}
				className={cn(
					'fill-surface-container-lowest stroke-outline-variant transition-colors group-hover:stroke-primary group-focus-visible:stroke-primary',
					selected && 'fill-primary/5 stroke-primary',
				)}
				strokeWidth={selected ? 2 : 1}
			/>
			<Icon x={node.x + 16} y={node.y + 16} size={20} className={LAYER_ICON_COLOR[node.layer]} />
			<text
				x={node.x + 48}
				y={node.label ? node.y + 23 : node.y + 31}
				className="fill-on-surface font-headline text-[15px] font-bold"
			>
				{node.label ?? layerLabel}
			</text>
			{node.label && (
				<text x={node.x + 48} y={node.y + 40} className="fill-outline text-[11px]">
					{layerLabel}
				</text>
			)}
			<text
				x={node.x + node.width - 16}
				y={node.y + 31}
				textAnchor="end"
				className="fill-outline text-[14px] font-semibold"
			>
				{node.items.length}
			</text>
		</>
	);
	if (!onSelect) return <g>{shape}</g>;
	return (
		// biome-ignore lint/a11y/useSemanticElements: SVG has no <button>; the group is focusable and handles Enter/Space
		<g
			role="button"
			tabIndex={0}
			aria-pressed={selected}
			aria-label={`${node.label ?? layerLabel}: ${node.items.length}`}
			className="group cursor-pointer outline-none"
			onClick={onSelect}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect();
				}
			}}
		>
			{shape}
		</g>
	);
}
