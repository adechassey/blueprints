import { z } from 'zod';

export const createStackSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be kebab-case')
		.optional(),
	description: z.string().optional(),
	/** Technology slugs composing the stack (created on the fly if unknown). */
	technologies: z.array(z.string().min(1).max(100)).min(1).max(50),
});

export type CreateStackInput = z.infer<typeof createStackSchema>;

export const updateStackSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().optional(),
	technologies: z.array(z.string().min(1).max(100)).min(1).max(50).optional(),
});

export type UpdateStackInput = z.infer<typeof updateStackSchema>;
