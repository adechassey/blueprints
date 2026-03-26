import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
	testDir: './e2e',
	timeout: 30000,
	retries: 0,
	use: {
		baseURL: 'http://localhost:5173',
		headless: true,
	},
	webServer: {
		command: isCI ? 'pnpm --filter webapp preview --port 5173' : 'pnpm --filter webapp dev',
		port: 5173,
		reuseExistingServer: true,
		timeout: 30000,
	},
});
