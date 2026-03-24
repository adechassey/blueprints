import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
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

export const app = new OpenAPIHono();

app.use(
	'*',
	cors({
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
	}),
);
app.onError(errorHandler);

app.route('/api', healthRoute);
app.route('/api', authRoute);
app.route('/api', blueprintRoutes);
app.route('/api', tagRoutes);
app.route('/api', projectRoutes);
app.route('/api', searchRoutes);
app.route('/api', embeddingsRoute);
app.route('/api', commentRoutes);
app.route('/api', userRoutes);
app.route('/api', mcpRoute);
