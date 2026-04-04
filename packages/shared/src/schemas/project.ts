import { z } from 'zod';

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

export const addBlueprintToProjectSchema = z.object({
	blueprintId: z.string().uuid(),
});

export type AddBlueprintToProjectInput = z.infer<typeof addBlueprintToProjectSchema>;
