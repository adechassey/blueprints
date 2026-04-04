import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getConfigDir, getConfigPath, getDefaultServerUrl } from './auth.core.js';

describe('getConfigDir', () => {
	it('returns ~/.theodo-blueprints', () => {
		expect(getConfigDir()).toBe(join(homedir(), '.theodo-blueprints'));
	});
});

describe('getConfigPath', () => {
	it('returns config.json inside config dir', () => {
		expect(getConfigPath()).toBe(join(homedir(), '.theodo-blueprints', 'config.json'));
	});
});

describe('getDefaultServerUrl', () => {
	it('returns expected URL', () => {
		expect(getDefaultServerUrl()).toBe('https://blueprints-api.vercel.app');
	});
});
