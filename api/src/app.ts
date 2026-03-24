import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoute } from './routes/health.js';

export const app = new OpenAPIHono();

app.use('*', cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.onError(errorHandler);

app.route('/api', healthRoute);
