import { z } from 'zod';

export const createBlueprintSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().optional(),
	usage: z.string().optional(),
	stack: z.enum(['server', 'webapp', 'shared', 'fullstack']),
	layer: z.string().min(1),
	projectId: z.string().uuid().optional(),
	tags: z.array(z.string()).optional(),
	content: z.string().min(1),
	isPublic: z.boolean().optional().default(true),
});

export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>;

export const updateBlueprintSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().optional(),
	usage: z.string().optional(),
	stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
	layer: z.string().min(1).optional(),
	projectId: z.string().uuid().nullable().optional(),
	tags: z.array(z.string()).optional(),
	content: z.string().min(1).optional(),
	changelog: z.string().optional(),
	isPublic: z.boolean().optional(),
});

export type UpdateBlueprintInput = z.infer<typeof updateBlueprintSchema>;

export const listBlueprintsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
	layer: z.string().optional(),
	tag: z.string().optional(),
	projectId: z.string().uuid().optional(),
	authorId: z.string().uuid().optional(),
});

export type ListBlueprintsInput = z.infer<typeof listBlueprintsSchema>;

export const createProjectSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/),
	description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
