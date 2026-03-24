import { Hono } from 'hono';
import { dispatchTool, mcpTools } from '../mcp/server.js';
import { getUser, requireAuth } from '../middleware/auth.js';

export const mcpRoute = new Hono()
	.get('/mcp', (c) => {
		return c.json({
			name: 'theodo-blueprints',
			version: '0.0.0',
			description: 'Theodo Blueprints MCP Server',
			tools: mcpTools.map((t) => t.name),
			resources: ['blueprint://{id}', 'project://{slug}'],
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
					protocolVersion: '2024-11-05',
					capabilities: { tools: {}, resources: {} },
					serverInfo: { name: 'theodo-blueprints', version: '0.0.0' },
				},
			});
		}

		if (body.method === 'tools/list') {
			return c.json({
				jsonrpc: '2.0',
				id: body.id,
				result: {
					tools: mcpTools.map((t) => ({
						name: t.name,
						description: t.description,
					})),
				},
			});
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
