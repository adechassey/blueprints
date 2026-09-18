import { eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { blueprints, projects } from '../db/schema.js';
import { dispatchTool, getToolDefinitions } from '../mcp/server.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import { getBlueprintById } from '../services/blueprints.js';

const RESOURCE_TEMPLATES = [
	{
		uriTemplate: 'blueprint://{id}',
		name: 'Blueprint',
		description: 'Full blueprint content by ID or slug',
	},
	{
		uriTemplate: 'project://{slug}',
		name: 'Project',
		description: 'Project overview with blueprint count',
	},
];

async function readResource(uri: string) {
	const blueprintMatch = /^blueprint:\/\/(.+)$/.exec(uri);
	if (blueprintMatch) {
		const id = blueprintMatch[1];
		if (!id) throw new Error(`Invalid blueprint URI: ${uri}`);
		const blueprint = await getBlueprintById(db, decodeURIComponent(id));
		if (!blueprint) throw new Error(`Blueprint not found: ${blueprintMatch[1]}`);
		return {
			contents: [
				{
					uri,
					mimeType: 'text/markdown',
					text: blueprint.currentVersion?.content ?? '',
				},
			],
		};
	}

	const projectMatch = /^project:\/\/(.+)$/.exec(uri);
	if (projectMatch) {
		const slug = projectMatch[1];
		if (!slug) throw new Error(`Invalid project URI: ${uri}`);
		const matches = await db
			.select()
			.from(projects)
			.where(eq(projects.slug, decodeURIComponent(slug)))
			.limit(1);
		const project = matches.at(0);
		if (!project) throw new Error(`Project not found: ${slug}`);
		const countRows = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(blueprints)
			.where(eq(blueprints.projectId, project.id));
		const count = countRows.at(0)?.count ?? 0;
		return {
			contents: [
				{
					uri,
					mimeType: 'application/json',
					text: JSON.stringify({ ...project, blueprintCount: count }, null, 2),
				},
			],
		};
	}

	throw new Error(`Unknown resource: ${uri}`);
}

export const mcpRoute = new Hono()
	.get('/mcp', (c) => {
		return c.json({
			name: 'theodo-blueprints',
			version: '0.0.0',
			description: 'Theodo Blueprints MCP Server',
			tools: getToolDefinitions().map((t) => t.name),
			resources: RESOURCE_TEMPLATES.map((r) => r.uriTemplate),
		});
	})
	.post('/mcp', requireAuth, async (c) => {
		const user = getUser(c);
		const body = await c.req.json();

		if (body.method === 'initialize') {
			return c.json({
				jsonrpc: '2.0',
				id: body.id,
				result: {
					protocolVersion: body.params?.protocolVersion ?? '2024-11-05',
					capabilities: { tools: {}, resources: {} },
					serverInfo: { name: 'theodo-blueprints', version: '0.0.0' },
				},
			});
		}

		if (body.method === 'tools/list') {
			return c.json({
				jsonrpc: '2.0',
				id: body.id,
				result: { tools: getToolDefinitions() },
			});
		}

		if (body.method === 'resources/list') {
			return c.json({
				jsonrpc: '2.0',
				id: body.id,
				result: { resources: RESOURCE_TEMPLATES },
			});
		}

		if (body.method === 'resources/read') {
			const { uri } = body.params ?? {};
			try {
				const result = await readResource(uri);
				return c.json({ jsonrpc: '2.0', id: body.id, result });
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				return c.json({ jsonrpc: '2.0', id: body.id, error: { code: -32002, message: msg } });
			}
		}

		if (body.method === 'tools/call') {
			const { name, arguments: args } = body.params;
			try {
				const result = await dispatchTool(name, args || {}, user.id);
				return c.json({ jsonrpc: '2.0', id: body.id, result });
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Unknown error';
				return c.json({
					jsonrpc: '2.0',
					id: body.id,
					error: { code: -32603, message: msg },
				});
			}
		}

		return c.json({
			jsonrpc: '2.0',
			id: body.id,
			error: { code: -32601, message: `Method not supported: ${body.method}` },
		});
	});
