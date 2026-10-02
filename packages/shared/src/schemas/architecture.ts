import { z } from 'zod';
import { blueprintLayerSchema } from './blueprint.js';

/**
 * A project's architecture map configuration: how its blueprints group into
 * zones (a webapp, a server, a shared package…). Layers stay the closed
 * vocabulary; a zone only regroups them and may rename them for display.
 */

const zoneIdSchema = z
	.string()
	.min(1)
	.max(40)
	.regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only');

const displayLabelSchema = z.string().trim().min(1).max(40);

const architectureZoneSchema = z.object({
	id: zoneIdSchema,
	label: displayLabelSchema,
	/** Short subtitle shown next to the zone name, e.g. its runtime. */
	hint: z.string().trim().max(60).optional(),
	/**
	 * Technology slugs that place a blueprint in this zone. Exactly one zone
	 * omits them: it catches every blueprint no other zone matches.
	 */
	technologies: z.array(z.string().min(1)).min(1).optional(),
	/** Drawn as a band under the other zones, which all import it. */
	shared: z.boolean().optional(),
	/** Display names for layers inside this zone, e.g. `api` → "HTTP endpoints". */
	layerLabels: z.partialRecord(blueprintLayerSchema, displayLabelSchema).optional(),
});

export type ArchitectureZone = z.infer<typeof architectureZoneSchema>;

/** An arrow between the same layer of two side-by-side zones, e.g. webapp api → server api. */
const architectureEdgeSchema = z.object({
	from: zoneIdSchema,
	to: zoneIdSchema,
	layer: blueprintLayerSchema,
	label: z.string().trim().min(1).max(20).optional(),
});

export type ArchitectureEdge = z.infer<typeof architectureEdgeSchema>;

export const projectArchitectureSchema = z
	.object({
		zones: z.array(architectureZoneSchema).min(1).max(4),
		edges: z.array(architectureEdgeSchema).max(8).optional(),
	})
	.superRefine((config, ctx) => {
		const ids = new Set<string>();
		config.zones.forEach((zone, index) => {
			if (ids.has(zone.id)) {
				ctx.addIssue({
					code: 'custom',
					path: ['zones', index, 'id'],
					message: `Duplicate zone id "${zone.id}"`,
				});
			}
			ids.add(zone.id);
		});

		const catchAll = config.zones.filter((zone) => !zone.technologies);
		if (catchAll.length !== 1) {
			ctx.addIssue({
				code: 'custom',
				path: ['zones'],
				message: `Exactly one zone must omit "technologies" to catch the remaining blueprints (found ${catchAll.length})`,
			});
		}

		const columns = config.zones.filter((zone) => !zone.shared);
		if (columns.length === 0) {
			ctx.addIssue({
				code: 'custom',
				path: ['zones'],
				message: 'At least one zone must not be shared',
			});
		}
		if (config.zones.length - columns.length > 1) {
			ctx.addIssue({ code: 'custom', path: ['zones'], message: 'At most one zone can be shared' });
		}

		const column = (id: string) => columns.findIndex((zone) => zone.id === id);
		config.edges?.forEach((edge, index) => {
			const from = column(edge.from);
			const to = column(edge.to);
			if (from === -1 || to === -1) {
				ctx.addIssue({
					code: 'custom',
					path: ['edges', index],
					message: `Edges connect non-shared zones: "${from === -1 ? edge.from : edge.to}" is not one`,
				});
			} else if (Math.abs(from - to) !== 1) {
				ctx.addIssue({
					code: 'custom',
					path: ['edges', index],
					message: `Edges connect zones side by side: "${edge.from}" and "${edge.to}" are not`,
				});
			}
		});
	});

export type ProjectArchitecture = z.infer<typeof projectArchitectureSchema>;
