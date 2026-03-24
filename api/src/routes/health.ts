import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

export const healthRoute = new OpenAPIHono();

const route = createRoute({
	method: 'get',
	path: '/health',
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.object({ status: z.string() }),
				},
			},
			description: 'Health check',
		},
	},
});

healthRoute.openapi(route, (c) => {
	return c.json({ status: 'ok' }, 200);
});
