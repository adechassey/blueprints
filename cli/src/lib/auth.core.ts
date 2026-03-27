/**
 * Pure auth utility functions.
 * No I/O — 100% test coverage required.
 */

import { homedir } from 'node:os';
import { join } from 'node:path';

export function getConfigDir(): string {
	return join(homedir(), '.theodo-blueprints');
}

export function getConfigPath(): string {
	return join(getConfigDir(), 'config.json');
}

export function getDefaultServerUrl(): string {
	return 'https://blueprints-api.vercel.app';
}
