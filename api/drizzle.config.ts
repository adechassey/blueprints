import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './src/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: env var validated at startup
		url: process.env.DATABASE_URL!,
	},
});
