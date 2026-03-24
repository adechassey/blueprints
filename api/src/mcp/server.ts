import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { blueprints, projects } from '../db/schema.js';
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
		stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
		layer: z.string().optional(),
		tag: z.string().optional(),
		limit: z.number().int().min(1).max(50).default(10),
	}),
	handler: async (args) => {
		const { query, stack, layer, tag, limit } = args as {
			query: string;
			stack?: string;
			layer?: string;
			tag?: string;
			limit?: number;
		};
		const result = await semanticSearch(db, query, { stack, layer, tag, limit });
		return { content: [{ type: 'text' as const, text: JSON.stringify(result.items, null, 2) }] };
	},
};

const getBlueprintTool: ToolDefinition = {
	name: 'get_blueprint',
	description: 'Get a blueprint by ID or slug',
	inputSchema: z.object({ id: z.string().describe('Blueprint ID or slug') }),
	handler: async (args) => {
		const blueprint = await getBlueprintById(db, args.id as string);
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
		stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
		layer: z.string().optional(),
		tag: z.string().optional(),
		projectId: z.string().optional(),
		limit: z.number().int().min(1).max(100).default(20),
		page: z.number().int().min(1).default(1),
	}),
	handler: async (args) => {
		const result = await listBlueprints(db, args as Parameters<typeof listBlueprints>[1]);
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
		stack: z.enum(['server', 'webapp', 'shared', 'fullstack']),
		layer: z.string(),
		content: z.string(),
		tags: z.array(z.string()).optional(),
		projectId: z.string().optional(),
	}),
	handler: async (input, authorId) => {
		const blueprint = await createBlueprint(
			db,
			{
				...(input as {
					name: string;
					stack: 'server' | 'webapp' | 'shared' | 'fullstack';
					layer: string;
					content: string;
					description?: string;
					usage?: string;
					tags?: string[];
					projectId?: string;
				}),
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
		version: z.number().int().optional().describe('Specific version number'),
	}),
	handler: async (args) => {
		const { id, version } = args as { id: string; version?: number };
		const blueprint = await getBlueprintById(db, id);
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
	}));
}
