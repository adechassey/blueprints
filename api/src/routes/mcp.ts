import { Hono } from 'hono';

export const mcpRoute = new Hono()
	.get('/mcp', (c) => {
		return c.json({
			name: 'theodo-blueprints',
			version: '0.0.0',
			description: 'Theodo Blueprints MCP Server',
			tools: [
				'search_blueprints',
				'get_blueprint',
				'list_blueprints',
				'list_projects',
				'publish_blueprint',
				'update_blueprint',
				'download_blueprint',
			],
			resources: ['blueprint://{id}', 'project://{slug}'],
		});
	})
	.post('/mcp', async (c) => {
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

		return c.json(
			{
				jsonrpc: '2.0',
				id: body.id,
				error: { code: -32601, message: 'Method not yet implemented via HTTP' },
			},
			200,
		);
	});
