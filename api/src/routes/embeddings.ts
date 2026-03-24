import { eq, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/index.js';
import { blueprints, blueprintVersions } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { prepareEmbeddingText } from '../services/embeddings.core.js';
import { generateEmbedding } from '../services/embeddings.js';

export const embeddingsRoute = new Hono();

// Generate embedding for text
embeddingsRoute.post('/embeddings', requireAuth, async (c) => {
	const { text } = await c.req.json<{ text: string }>();
	if (!text) {
		return c.json({ error: 'text is required' }, 400);
	}
	const embedding = await generateEmbedding(text);
	return c.json({ embedding });
});

// Backfill null embeddings (admin only)
embeddingsRoute.post('/embeddings/backfill', requireAuth, requireRole('admin'), async (c) => {
	const versions = await db
		.select({
			id: blueprintVersions.id,
			content: blueprintVersions.content,
			blueprintId: blueprintVersions.blueprintId,
		})
		.from(blueprintVersions)
		.where(isNull(blueprintVersions.embedding));

	let processed = 0;
	let failed = 0;

	for (const version of versions) {
		try {
			const [blueprint] = await db
				.select({ description: blueprints.description, usage: blueprints.usage })
				.from(blueprints)
				.where(eq(blueprints.id, version.blueprintId))
				.limit(1);

			const text = prepareEmbeddingText({
				description: blueprint?.description,
				usage: blueprint?.usage,
				content: version.content,
			});

			const embedding = await generateEmbedding(text);
			await db
				.update(blueprintVersions)
				.set({ embedding })
				.where(eq(blueprintVersions.id, version.id));

			processed++;
		} catch {
			failed++;
		}
	}

	return c.json({ processed, failed, total: versions.length });
});
