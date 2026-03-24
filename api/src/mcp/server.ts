import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { db } from '../db/index.js';
import {
	createBlueprint,
	getBlueprintById,
	listBlueprints,
	updateBlueprint,
} from '../services/blueprints.js';
import { semanticSearch } from '../services/search.js';

export const mcpServer = new McpServer({
	name: 'theodo-blueprints',
	version: '0.0.0',
});

// Search blueprints tool
mcpServer.tool(
	'search_blueprints',
	'Search for blueprints using natural language',
	{
		query: z.string().describe('Natural language search query'),
		stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
		layer: z.string().optional(),
		tag: z.string().optional(),
		limit: z.number().int().min(1).max(50).default(10),
	},
	async ({ query, stack, layer, tag, limit }) => {
		const result = await semanticSearch(db, query, { stack, layer, tag, limit });
		return { content: [{ type: 'text' as const, text: JSON.stringify(result.items, null, 2) }] };
	},
);

// Get blueprint tool
mcpServer.tool(
	'get_blueprint',
	'Get a blueprint by ID or slug',
	{
		id: z.string().describe('Blueprint ID or slug'),
	},
	async ({ id }) => {
		const blueprint = await getBlueprintById(db, id);
		if (!blueprint) {
			return { content: [{ type: 'text' as const, text: 'Blueprint not found' }] };
		}
		return { content: [{ type: 'text' as const, text: JSON.stringify(blueprint, null, 2) }] };
	},
);

// List blueprints tool
mcpServer.tool(
	'list_blueprints',
	'List blueprints with optional filters',
	{
		stack: z.enum(['server', 'webapp', 'shared', 'fullstack']).optional(),
		layer: z.string().optional(),
		tag: z.string().optional(),
		projectId: z.string().optional(),
		limit: z.number().int().min(1).max(100).default(20),
		page: z.number().int().min(1).default(1),
	},
	async (filters) => {
		const result = await listBlueprints(db, filters);
		return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
	},
);

// List projects tool
mcpServer.tool('list_projects', 'List available projects', {}, async () => {
	const { projects } = await import('../db/schema.js');
	const { desc } = await import('drizzle-orm');
	const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
	return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
});

// Publish blueprint tool
mcpServer.tool(
	'publish_blueprint',
	'Create a new blueprint',
	{
		name: z.string(),
		description: z.string().optional(),
		usage: z.string().optional(),
		stack: z.enum(['server', 'webapp', 'shared', 'fullstack']),
		layer: z.string(),
		content: z.string(),
		tags: z.array(z.string()).optional(),
		projectId: z.string().optional(),
	},
	async (input) => {
		// TODO: Get authenticated user ID from MCP session context
		const authorId = 'mcp-placeholder';
		try {
			const blueprint = await createBlueprint(db, { ...input, isPublic: true }, authorId);
			return {
				content: [{ type: 'text' as const, text: JSON.stringify(blueprint, null, 2) }],
			};
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error';
			return { content: [{ type: 'text' as const, text: `Error: ${msg}` }] };
		}
	},
);

// Update blueprint tool
mcpServer.tool(
	'update_blueprint',
	'Update an existing blueprint (creates new version if content changes)',
	{
		id: z.string().describe('Blueprint ID'),
		content: z.string().optional(),
		name: z.string().optional(),
		description: z.string().optional(),
		changelog: z.string().optional(),
	},
	async (input) => {
		const authorId = 'mcp-placeholder';
		try {
			const updated = await updateBlueprint(db, input.id, input, authorId);
			return {
				content: [{ type: 'text' as const, text: JSON.stringify(updated, null, 2) }],
			};
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Unknown error';
			return { content: [{ type: 'text' as const, text: `Error: ${msg}` }] };
		}
	},
);

// Download blueprint tool
mcpServer.tool(
	'download_blueprint',
	'Download blueprint content (increments download count)',
	{
		id: z.string().describe('Blueprint ID or slug'),
		version: z.number().int().optional().describe('Specific version number'),
	},
	async ({ id, version }) => {
		const blueprint = await getBlueprintById(db, id);
		if (!blueprint) {
			return { content: [{ type: 'text' as const, text: 'Blueprint not found' }] };
		}

		let content: string;
		if (version && blueprint.currentVersion) {
			const { getVersion } = await import('../services/blueprints.js');
			const ver = await getVersion(db, blueprint.id, version);
			content = ver?.content ?? 'Version not found';
		} else {
			content = blueprint.currentVersion?.content ?? '';
		}

		// Increment download count
		const { blueprints } = await import('../db/schema.js');
		const { eq, sql } = await import('drizzle-orm');
		await db
			.update(blueprints)
			.set({ downloadCount: sql`${blueprints.downloadCount} + 1` })
			.where(eq(blueprints.id, blueprint.id));

		return { content: [{ type: 'text' as const, text: content }] };
	},
);

// Resources
mcpServer.resource('blueprint://{id}', 'Get blueprint content by ID', async (uri) => {
	const id = uri.pathname.replace(/^\/\//, '');
	const blueprint = await getBlueprintById(db, id);
	if (!blueprint) {
		return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'Not found' }] };
	}
	return {
		contents: [
			{
				uri: uri.href,
				mimeType: 'text/markdown',
				text: blueprint.currentVersion?.content ?? '',
			},
		],
	};
});

mcpServer.resource('project://{slug}', 'Get project overview', async (uri) => {
	const slug = uri.pathname.replace(/^\/\//, '');
	const { projects, blueprints: blueprintsTable } = await import('../db/schema.js');
	const { eq, desc } = await import('drizzle-orm');

	const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
	if (!project) {
		return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'Not found' }] };
	}

	const bps = await db
		.select()
		.from(blueprintsTable)
		.where(eq(blueprintsTable.projectId, project.id))
		.orderBy(desc(blueprintsTable.createdAt));

	const text = `# ${project.name}\n\n${project.description || ''}\n\n## Blueprints\n\n${bps.map((b) => `- ${b.name} (${b.stack}/${b.layer})`).join('\n')}`;

	return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text }] };
});
