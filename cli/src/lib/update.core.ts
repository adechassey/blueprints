/**
 * Pure update-check helpers.
 * No I/O — 100% test coverage required.
 */

export const GITHUB_REPO = 'adechassey/blueprints';
export const LATEST_RELEASE_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const UPDATE_CHECK_OPT_OUT_ENV = 'THEODO_BLUEPRINTS_NO_UPDATE_CHECK';

const INSTALL_COMMANDS = {
	unix: `curl -fsSL https://raw.githubusercontent.com/${GITHUB_REPO}/main/install.sh | sh`,
	windows: `irm https://raw.githubusercontent.com/${GITHUB_REPO}/main/install.ps1 | iex`,
} as const;

export type SemVer = [major: number, minor: number, patch: number];

/** Parses "1.2.3", "v1.2.3" or "cli-v1.2.3". Returns null for anything else (e.g. "dev"). */
export function parseVersion(input: string): SemVer | null {
	const match = /^(?:cli-)?v?(\d+)\.(\d+)\.(\d+)$/.exec(input.trim());
	if (!match) return null;
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** "cli-v0.2.0" → "0.2.0"; unparsable input is returned unchanged. */
export function normalizeVersion(input: string): string {
	const parsed = parseVersion(input);
	return parsed ? parsed.join('.') : input;
}

/** True when `latest` is strictly newer than `current`. Unparsable versions never trigger an update. */
export function isNewerVersion(current: string, latest: string): boolean {
	const a = parseVersion(current);
	const b = parseVersion(latest);
	if (!a || !b) return false;
	const [aMajor, aMinor, aPatch] = a;
	const [bMajor, bMinor, bPatch] = b;
	if (bMajor !== aMajor) return bMajor > aMajor;
	if (bMinor !== aMinor) return bMinor > aMinor;
	return bPatch > aPatch;
}

export function getInstallCommand(platform: string): string {
	return platform === 'win32' ? INSTALL_COMMANDS.windows : INSTALL_COMMANDS.unix;
}

export interface UpdateCache {
	lastCheckedAt: number;
	latestVersion: string;
}

export function isCacheStale(cache: UpdateCache | null, now: number): boolean {
	return cache === null || now - cache.lastCheckedAt >= UPDATE_CHECK_INTERVAL_MS;
}

export interface UpdateCheckContext {
	currentVersion: string;
	env: Record<string, string | undefined>;
	isTTY: boolean;
}

/** Passive checks are skipped for dev builds, in CI, when opted out, or without a terminal. */
export function isUpdateCheckEnabled({ currentVersion, env, isTTY }: UpdateCheckContext): boolean {
	if (parseVersion(currentVersion) === null) return false;
	if (env.CI || env[UPDATE_CHECK_OPT_OUT_ENV]) return false;
	return isTTY;
}

/** Extracts `tag_name` from a GitHub release payload; null when absent or malformed. */
export function extractTagName(payload: unknown): string | null {
	if (typeof payload !== 'object' || payload === null) return null;
	const tag = (payload as { tag_name?: unknown }).tag_name;
	return typeof tag === 'string' && tag.length > 0 ? tag : null;
}

export function formatUpdateNotice(current: string, latest: string, platform: string): string {
	return [
		`Update available: ${current} → ${normalizeVersion(latest)}`,
		`Run: theodo-blueprints update   (or: ${getInstallCommand(platform)})`,
	].join('\n');
}
