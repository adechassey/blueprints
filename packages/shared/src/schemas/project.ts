import { z } from 'zod';
import { projectArchitectureSchema } from './architecture.js';

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
	// null resets the project to the default single-zone map
	architecture: projectArchitectureSchema.nullable().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
