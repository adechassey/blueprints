import { z } from 'zod';

/**
 * Architecture layers — the closed vocabulary classifying where a blueprint
 * sits in an application architecture. Layers are the grouping axis used to
 * scaffold a boilerplate from a set of technologies.
 */
export const BLUEPRINT_LAYERS = [
	'database',
	'api',
	'domain',
	'ui',
	'state',
	'infra',
	'testing',
	'tooling',
] as const;

export const blueprintLayerSchema = z.enum(BLUEPRINT_LAYERS);
export type BlueprintLayer = (typeof BLUEPRINT_LAYERS)[number];

/** Categories of the technology taxonomy (curated list, seeded in the DB). */
export const TECHNOLOGY_CATEGORIES = [
	'language',
	'framework',
	'library',
	'database',
	'infra',
	'tooling',
] as const;

export type TechnologyCategory = (typeof TECHNOLOGY_CATEGORIES)[number];

/** Parses a comma-separated `techno` query param into a list of slugs. */
export const technoFilterSchema = z
	.string()
	.optional()
	.transform((v) =>
		v
			?.split(',')
			.map((s) => s.trim())
			.filter(Boolean),
	);

export const createBlueprintSchema = z.object({
	name: z.string().min(1).max(200),
	slug: z
		.string()
		.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be kebab-case')
		.optional(),
	source: z.string().max(500).optional(),
	description: z.string().optional(),
	usage: z.string().optional(),
	/** Technology slugs the blueprint applies to (created on the fly if unknown). */
	technologies: z.array(z.string().min(1).max(100)).max(20).optional(),
	layer: blueprintLayerSchema,
	projectId: z.string().uuid().optional(),
	tags: z.array(z.string()).optional(),
	content: z.string().min(1),
	isPublic: z.boolean().optional().default(true),
});

export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>;

export const updateBlueprintSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	slug: z
		.string()
		.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be kebab-case')
		.optional(),
	source: z.string().max(500).optional(),
	description: z.string().optional(),
	usage: z.string().optional(),
	technologies: z.array(z.string().min(1).max(100)).max(20).optional(),
	layer: blueprintLayerSchema.optional(),
	tags: z.array(z.string()).optional(),
	content: z.string().min(1).optional(),
	changelog: z.string().optional(),
	isPublic: z.boolean().optional(),
});

export type UpdateBlueprintInput = z.infer<typeof updateBlueprintSchema>;

export const listBlueprintsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	/** Comma-separated technology slugs (any-match). */
	techno: technoFilterSchema,
	layer: blueprintLayerSchema.optional(),
	tag: z.string().optional(),
	projectId: z.string().uuid().optional(),
	project: z.string().optional(),
	authorId: z.string().uuid().optional(),
});

export type ListBlueprintsInput = z.infer<typeof listBlueprintsSchema>;
