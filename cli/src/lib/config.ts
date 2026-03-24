import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getConfigDir, getConfigPath, getDefaultServerUrl } from './auth.core.js';

interface Config {
	server: string;
	token?: string;
	defaultProject?: string;
}

export function getConfig(): Config {
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
