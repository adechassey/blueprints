import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env from monorepo root (drizzle-kit runs from api/)
const rootEnv = resolve(process.cwd(), '..', '.env');
if (existsSync(rootEnv)) config({ path: rootEnv });
config(); // also check cwd

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './src/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: env var validated at startup
		url: process.env.DATABASE_URL!,
	},
});
