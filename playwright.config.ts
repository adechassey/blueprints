import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

const API_PORT = 3002;
const API_URL = `http://localhost:${API_PORT}`;
const E2E_DB_URL =
	process.env.E2E_DATABASE_URL ??
	'postgresql://blueprints:blueprints@localhost:5433/blueprints_e2e';

// Forced in E2E so the semantic search falls back to deterministic text search
// (avoids downloading the Transformers.js model on every run).
const E2E_API_ENV = {
	PORT: String(API_PORT),
	DATABASE_URL: E2E_DB_URL,
	BETTER_AUTH_SECRET: 'e2e-secret-for-tests-only',
	BETTER_AUTH_URL: API_URL,
	GOOGLE_CLIENT_ID: 'e2e-dummy',
	GOOGLE_CLIENT_SECRET: 'e2e-dummy',
	CORS_ORIGIN: 'http://localhost:5173',
	HF_HUB_OFFLINE: '1',
	// Effectively disable rate limiting for the E2E run (shared 'unknown' IP bucket)
	RATE_LIMIT_GENERAL: '100000',
	RATE_LIMIT_STRICT: '1000',
	RATE_LIMIT_DOWNLOAD: '1000',
};

export default defineConfig({
	globalSetup: './e2e/global-setup.ts',
	testDir: './e2e',
	timeout: 30000,
	retries: isCI ? 1 : 0,
	// Shared state (one E2E database, ordered cleanups) requires a single worker:
	// parallel spec files would purge each other's fixtures mid-test.
	workers: 1,
	fullyParallel: false,
	use: {
		baseURL: 'http://localhost:5173',
		headless: true,
	},
	webServer: [
		{
			command: 'pnpm --filter webapp dev',
			port: 5173,
			reuseExistingServer: true,
			timeout: 60000,
			env: { VITE_API_URL: API_URL },
		},
		{
			command: 'pnpm --filter api exec tsx src/index.ts',
			port: API_PORT,
			reuseExistingServer: true,
			timeout: 60000,
			env: E2E_API_ENV,
		},
	],
});
