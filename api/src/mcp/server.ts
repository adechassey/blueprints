import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { blueprints, projects } from '../db/schema.js';
import { blueprintLayerSchema, technoFilterSchema } from '../lib/validation.js';
import {
	createBlueprint,
	getBlueprintById,
	getVersion,
	listBlueprints,
	updateBlueprint,
} from '../services/blueprints.js';
import { semanticSearch } from '../services/search.js';

interface ToolDefinition {
	name: string;
	description: string;
	inputSchema: z.ZodType;
	handler: (
		args: Record<string, unknown>,
		authorId: string,
	) => Promise<{ content: { type: 'text'; text: string }[] }>;
}

const searchBlueprintsTool: ToolDefinition = {
	name: 'search_blueprints',
	description: 'Search for blueprints using natural language',
	inputSchema: z.object({
		query: z.string().describe('Natural language search query'),
		techno: z.string().optional().describe('Comma-separated technology slugs (any-match)'),
		layer: blueprintLayerSchema.optional(),
		tag: z.string().optional(),
		limit: z.number().int().min(1).max(50).default(10),
	}),
	handler: async (args) => {
		const { query, techno, layer, tag, limit } = args as {
			query: string;
			techno?: string;
			layer?: string;
			tag?: string;
			limit?: number;
		};
		const result = await semanticSearch(db, query, {
			technologies: technoFilterSchema.parse(techno),
			layer: layer as never,
			tag,
			limit,
		});
		return { content: [{ type: 'text' as const, text: JSON.stringify(result.items, null, 2) }] };
	},
};

const getBlueprintTool: ToolDefinition = {
	name: 'get_blueprint',
	description: 'Get a blueprint by ID or slug',
	inputSchema: z.object({
		id: z.string().describe('Blueprint ID or slug'),
		project: z
			.string()
			.optional()
			.describe('Project slug or ID that scopes a slug lookup (slugs are unique per project)'),
	}),
	handler: async (args) => {
		const { id, project } = args as { id: string; project?: string };
		const blueprint = await getBlueprintById(db, id, project);
		if (!blueprint) {
			return { content: [{ type: 'text' as const, text: 'Blueprint not found' }] };
		}
		return { content: [{ type: 'text' as const, text: JSON.stringify(blueprint, null, 2) }] };
	},
};

const listBlueprintsTool: ToolDefinition = {
	name: 'list_blueprints',
	description: 'List blueprints with optional filters',
	inputSchema: z.object({
		techno: z.string().optional().describe('Comma-separated technology slugs (any-match)'),
		layer: blueprintLayerSchema.optional(),
		tag: z.string().optional(),
		projectId: z.string().optional(),
		limit: z.number().int().min(1).max(100).default(20),
		page: z.number().int().min(1).default(1),
	}),
	handler: async (args) => {
		const parsed = args as {
			techno?: string;
			layer?: string;
			tag?: string;
			projectId?: string;
			limit?: number;
			page?: number;
		};
		const result = await listBlueprints(db, {
			techno: technoFilterSchema.parse(parsed.techno),
			layer: parsed.layer as never,
			tag: parsed.tag,
			projectId: parsed.projectId,
			limit: parsed.limit ?? 20,
			page: parsed.page ?? 1,
		});
		return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
	},
};

const listProjectsTool: ToolDefinition = {
	name: 'list_projects',
	description: 'List available projects',
	inputSchema: z.object({}),
	handler: async () => {
		const { desc } = await import('drizzle-orm');
		const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
		return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
	},
};

const publishBlueprintTool: ToolDefinition = {
	name: 'publish_blueprint',
	description: 'Create a new blueprint',
	inputSchema: z.object({
		name: z.string(),
		description: z.string().optional(),
		usage: z.string().optional(),
		technologies: z.array(z.string()).optional(),
		layer: blueprintLayerSchema,
		content: z.string(),
		tags: z.array(z.string()).optional(),
		projectId: z.string().describe('UUID of the project that owns the blueprint'),
	}),
	handler: async (input, authorId) => {
		const { name, description, usage, technologies, layer, content, tags, projectId } = input as {
			name: string;
			description?: string;
			usage?: string;
			technologies?: string[];
			layer: string;
			content: string;
			tags?: string[];
			projectId: string;
		};
		const blueprint = await createBlueprint(
			db,
			{
				name,
				description,
				usage,
				technologies,
				layer: blueprintLayerSchema.parse(layer),
				content,
				tags,
				projectId,
				isPublic: true,
			},
			authorId,
		);
		return { content: [{ type: 'text' as const, text: JSON.stringify(blueprint, null, 2) }] };
	},
};

const updateBlueprintTool: ToolDefinition = {
	name: 'update_blueprint',
	description: 'Update an existing blueprint (creates new version if content changes)',
	inputSchema: z.object({
		id: z.string().describe('Blueprint ID'),
		content: z.string().optional(),
		name: z.string().optional(),
		description: z.string().optional(),
		changelog: z.string().optional(),
	}),
	handler: async (input, authorId) => {
		const { id, ...updateData } = input as {
			id: string;
			content?: string;
			name?: string;
			description?: string;
			changelog?: string;
		};
		const updated = await updateBlueprint(db, id, updateData, authorId);
		return { content: [{ type: 'text' as const, text: JSON.stringify(updated, null, 2) }] };
	},
};

const downloadBlueprintTool: ToolDefinition = {
	name: 'download_blueprint',
	description: 'Download blueprint content (increments download count)',
	inputSchema: z.object({
		id: z.string().describe('Blueprint ID or slug'),
		project: z
			.string()
			.optional()
			.describe('Project slug or ID that scopes a slug lookup (slugs are unique per project)'),
		version: z.number().int().optional().describe('Specific version number'),
	}),
	handler: async (args) => {
		const { id, project, version } = args as { id: string; project?: string; version?: number };
		const blueprint = await getBlueprintById(db, id, project);
		if (!blueprint) {
			return { content: [{ type: 'text' as const, text: 'Blueprint not found' }] };
		}

		let content: string;
		if (version) {
			const ver = await getVersion(db, blueprint.id, version);
			content = ver?.content ?? 'Version not found';
		} else {
			content = blueprint.currentVersion?.content ?? '';
		}

		await db
			.update(blueprints)
			.set({ downloadCount: sql`${blueprints.downloadCount} + 1` })
			.where(eq(blueprints.id, blueprint.id));

		return { content: [{ type: 'text' as const, text: content }] };
	},
};

export const mcpTools: ToolDefinition[] = [
	searchBlueprintsTool,
	getBlueprintTool,
	listBlueprintsTool,
	listProjectsTool,
	publishBlueprintTool,
	updateBlueprintTool,
	downloadBlueprintTool,
];

const toolMap = new Map(mcpTools.map((t) => [t.name, t]));

export async function dispatchTool(name: string, args: Record<string, unknown>, authorId: string) {
	const tool = toolMap.get(name);
	if (!tool) {
		throw new Error(`Unknown tool: ${name}`);
	}
	return tool.handler(args, authorId);
}

export function getToolDefinitions() {
	return mcpTools.map((t) => ({
		name: t.name,
		description: t.description,
		inputSchema: z.toJSONSchema(t.inputSchema),
	}));
}
