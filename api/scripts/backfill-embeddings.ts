/**
 * Backfill embeddings for blueprint versions that don't have one yet.
 *
 * Runs locally (not on Vercel) to avoid serverless timeout limits:
 * loads the Transformers.js pipeline once and writes embeddings straight
 * to the database. Safe to re-run — only rows with a NULL embedding are
 * processed, and each row is committed independently.
 *
 * Usage:
 *   pnpm --filter api embeddings:backfill                 # local DB (.env)
 *   pnpm --filter api embeddings:backfill -- --env-file=.env.local  # custom env
 */
import { eq, isNull } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { blueprints, blueprintVersions } from '../src/db/schema.js';
import { prepareEmbeddingText } from '../src/services/embeddings.core.js';
import { generateEmbedding } from '../src/services/embeddings.js';

async function main() {
	const versions = await db
		.select({
			id: blueprintVersions.id,
			content: blueprintVersions.content,
			blueprintId: blueprintVersions.blueprintId,
		})
		.from(blueprintVersions)
		.where(isNull(blueprintVersions.embedding));

	console.log(`Found ${versions.length} version(s) without an embedding.`);

	let processed = 0;
	let failed = 0;

	for (const [i, version] of versions.entries()) {
		const [blueprint] = await db
			.select({ description: blueprints.description, usage: blueprints.usage })
			.from(blueprints)
			.where(eq(blueprints.id, version.blueprintId))
			.limit(1);

		try {
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
			console.log(`[${i + 1}/${versions.length}] ok`);
		} catch (err) {
			failed++;
			console.error(`[${i + 1}/${versions.length}] FAILED:`, err);
		}
	}

	console.log(`Done. processed=${processed} failed=${failed}`);
	if (processed + failed > 0) {
		console.log('Closing DB connection...');
	}
	process.exit(failed > 0 ? 1 : 0);
}

main();
