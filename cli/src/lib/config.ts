import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getConfigDir, getConfigPath, getDefaultServerUrl } from './auth.core.js';

interface Config {
	server: string;
	token?: string;
	defaultProject?: string;
}

export function getConfig(): Config {
	// Env override to target a local/dev server without touching the saved config
	const envServer = process.env.BLUEPRINTS_SERVER_URL;
	if (envServer) return { server: envServer };

	const configPath = getConfigPath();
	if (!existsSync(configPath)) {
		return { server: getDefaultServerUrl() };
	}
	return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export function saveConfig(config: Config): void {
	const dir = getConfigDir();
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
}

export function saveToken(token: string): void {
	const config = getConfig();
	config.token = token;
	saveConfig(config);
}

export function clearToken(): void {
	const config = getConfig();
	config.token = undefined;
	saveConfig(config);
}
