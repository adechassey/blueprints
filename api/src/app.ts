import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './lib/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { generalRateLimit } from './middleware/rate-limit.js';
import { adminRoutes } from './routes/admin.js';
import { blueprintRoutes } from './routes/blueprints.js';
import { commentRoutes } from './routes/comments.js';
import { embeddingsRoute } from './routes/embeddings.js';
import { healthRoute } from './routes/health.js';
import { matchRoutes } from './routes/matches.js';
import { mcpRoute } from './routes/mcp.js';
import { previewAuthRoutes } from './routes/preview-auth.js';
import { projectRoutes } from './routes/projects.js';
import { tagRoutes } from './routes/tags.js';
import { userRoutes } from './routes/users.js';

const baseApp = new Hono();

baseApp.use(
	'*',
	cors({
		origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
		credentials: true,
	}),
);
baseApp.onError(errorHandler);
baseApp.use('/api/*', generalRateLimit);

export const app = baseApp
	.route('/api', healthRoute)
	.route('/api', blueprintRoutes)
	.route('/api', tagRoutes)
	.route('/api', projectRoutes)
	.route('/api', embeddingsRoute)
	.route('/api', commentRoutes)
	.route('/api', userRoutes)
	.route('/api', matchRoutes)
	.route('/api', mcpRoute)
	.route('/api', adminRoutes);

// Preview auth routes (session transfer between production and preview deployments)
app.route('/api', previewAuthRoutes);

// Auth routes registered after .route() chains — Better Auth handles its own routing
// Using all() to match any method, and the path must be exact to avoid trie conflicts
app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

export type AppType = typeof app;

export default app;
