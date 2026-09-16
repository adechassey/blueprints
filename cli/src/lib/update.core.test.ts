import { describe, expect, it } from 'vitest';
import {
	extractTagName,
	formatUpdateNotice,
	getInstallCommand,
	isCacheStale,
	isNewerVersion,
	isUpdateCheckEnabled,
	LATEST_RELEASE_URL,
	normalizeVersion,
	parseVersion,
	UPDATE_CHECK_INTERVAL_MS,
	UPDATE_CHECK_OPT_OUT_ENV,
} from './update.core.js';

describe('parseVersion', () => {
	it('parses plain, v-prefixed and cli-v-prefixed versions', () => {
		expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
		expect(parseVersion('v1.2.3')).toEqual([1, 2, 3]);
		expect(parseVersion('cli-v0.2.0')).toEqual([0, 2, 0]);
		expect(parseVersion('  10.0.1\n')).toEqual([10, 0, 1]);
	});

	it('returns null for anything that is not x.y.z', () => {
		expect(parseVersion('dev')).toBeNull();
		expect(parseVersion('1.2')).toBeNull();
		expect(parseVersion('1.2.3-beta')).toBeNull();
		expect(parseVersion('0.0.0-abc1234')).toBeNull();
		expect(parseVersion('')).toBeNull();
	});
});

describe('normalizeVersion', () => {
	it('strips release-tag prefixes', () => {
		expect(normalizeVersion('cli-v0.2.0')).toBe('0.2.0');
		expect(normalizeVersion('v1.0.0')).toBe('1.0.0');
	});

	it('returns unparsable input unchanged', () => {
		expect(normalizeVersion('dev')).toBe('dev');
	});
});

describe('isNewerVersion', () => {
	it('detects newer major, minor and patch', () => {
		expect(isNewerVersion('0.2.0', '1.0.0')).toBe(true);
		expect(isNewerVersion('0.2.0', '0.3.0')).toBe(true);
		expect(isNewerVersion('0.2.0', '0.2.1')).toBe(true);
	});

	it('is false for equal or older versions', () => {
		expect(isNewerVersion('0.2.0', '0.2.0')).toBe(false);
		expect(isNewerVersion('1.0.0', '0.9.9')).toBe(false);
		expect(isNewerVersion('0.3.0', '0.2.9')).toBe(false);
		expect(isNewerVersion('0.2.1', '0.2.0')).toBe(false);
	});

	it('never reports an update when either side is unparsable', () => {
		expect(isNewerVersion('dev', '0.2.0')).toBe(false);
		expect(isNewerVersion('0.2.0', 'unknown')).toBe(false);
	});

	it('accepts release tags as the latest version', () => {
		expect(isNewerVersion('0.2.0', 'cli-v0.3.0')).toBe(true);
	});
});

describe('getInstallCommand', () => {
	it('returns the PowerShell installer on Windows', () => {
		expect(getInstallCommand('win32')).toContain('install.ps1 | iex');
	});

	it('returns the shell installer elsewhere', () => {
		expect(getInstallCommand('darwin')).toContain('install.sh | sh');
		expect(getInstallCommand('linux')).toContain('install.sh | sh');
	});
});

describe('isCacheStale', () => {
	const now = 1_700_000_000_000;

	it('treats a missing cache as stale', () => {
		expect(isCacheStale(null, now)).toBe(true);
	});

	it('is fresh within the interval and stale from the interval on', () => {
		expect(isCacheStale({ lastCheckedAt: now - 1000, latestVersion: '0.2.0' }, now)).toBe(false);
		expect(
			isCacheStale({ lastCheckedAt: now - UPDATE_CHECK_INTERVAL_MS, latestVersion: '0.2.0' }, now),
		).toBe(true);
	});
});

describe('isUpdateCheckEnabled', () => {
	const enabled = { currentVersion: '0.2.0', env: {}, isTTY: true };

	it('is enabled for a released build on a terminal outside CI', () => {
		expect(isUpdateCheckEnabled(enabled)).toBe(true);
	});

	it('is disabled for dev builds', () => {
		expect(isUpdateCheckEnabled({ ...enabled, currentVersion: 'dev' })).toBe(false);
	});

	it('is disabled in CI', () => {
		expect(isUpdateCheckEnabled({ ...enabled, env: { CI: 'true' } })).toBe(false);
	});

	it('is disabled when the user opts out', () => {
		expect(isUpdateCheckEnabled({ ...enabled, env: { [UPDATE_CHECK_OPT_OUT_ENV]: '1' } })).toBe(
			false,
		);
	});

	it('is disabled without a terminal', () => {
		expect(isUpdateCheckEnabled({ ...enabled, isTTY: false })).toBe(false);
	});
});

describe('extractTagName', () => {
	it('returns the tag from a release payload', () => {
		expect(extractTagName({ tag_name: 'cli-v0.2.0' })).toBe('cli-v0.2.0');
	});

	it('returns null for missing, empty or non-string tags and non-object payloads', () => {
		expect(extractTagName({})).toBeNull();
		expect(extractTagName({ tag_name: '' })).toBeNull();
		expect(extractTagName({ tag_name: 42 })).toBeNull();
		expect(extractTagName(null)).toBeNull();
		expect(extractTagName('cli-v0.2.0')).toBeNull();
	});
});

describe('formatUpdateNotice', () => {
	it('names both versions and the platform installer', () => {
		const notice = formatUpdateNotice('0.2.0', 'cli-v0.3.0', 'darwin');
		expect(notice).toContain('0.2.0 → 0.3.0');
		expect(notice).toContain('theodo-blueprints update');
		expect(notice).toContain('install.sh | sh');
		expect(formatUpdateNotice('0.2.0', '0.3.0', 'win32')).toContain('install.ps1 | iex');
	});
});

describe('LATEST_RELEASE_URL', () => {
	it('points at the GitHub latest-release endpoint of the repo', () => {
		expect(LATEST_RELEASE_URL).toBe(
			'https://api.github.com/repos/adechassey/blueprints/releases/latest',
		);
	});
});
