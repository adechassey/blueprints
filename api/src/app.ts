import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { generalRateLimit } from './middleware/rate-limit.js';
import { adminRoutes } from './routes/admin.js';
import { authRoute } from './routes/auth.js';
import { blueprintRoutes } from './routes/blueprints.js';
import { commentRoutes } from './routes/comments.js';
import { embeddingsRoute } from './routes/embeddings.js';
import { healthRoute } from './routes/health.js';
import { mcpRoute } from './routes/mcp.js';
import { projectRoutes } from './routes/projects.js';
import { searchRoutes } from './routes/search.js';
import { tagRoutes } from './routes/tags.js';
import { userRoutes } from './routes/users.js';

const baseApp = new Hono();

baseApp.use(
	'*',
	cors({
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
	}),
);
baseApp.onError(errorHandler);
baseApp.use('/api/*', generalRateLimit);

export const app = baseApp
	.route('/api', healthRoute)
	.route('/api', authRoute)
	.route('/api', blueprintRoutes)
	.route('/api', tagRoutes)
	.route('/api', projectRoutes)
	.route('/api', searchRoutes)
	.route('/api', embeddingsRoute)
	.route('/api', commentRoutes)
	.route('/api', userRoutes)
	.route('/api', mcpRoute)
	.route('/api', adminRoutes);

export type AppType = typeof app;
