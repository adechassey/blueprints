import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { getConfigDir } from './auth.core.js';
import {
	extractTagName,
	formatUpdateNotice,
	isCacheStale,
	isNewerVersion,
	isUpdateCheckEnabled,
	LATEST_RELEASE_URL,
	normalizeVersion,
	type UpdateCache,
} from './update.core.js';
import { CLI_VERSION } from './version.js';

const FETCH_TIMEOUT_MS = 2000;

function getCachePath(): string {
	return join(getConfigDir(), 'update-check.json');
}

function readCache(): UpdateCache | null {
	try {
		const raw: unknown = JSON.parse(readFileSync(getCachePath(), 'utf-8'));
		if (
			typeof raw === 'object' &&
			raw !== null &&
			typeof (raw as UpdateCache).lastCheckedAt === 'number' &&
			typeof (raw as UpdateCache).latestVersion === 'string'
		) {
			return raw as UpdateCache;
		}
	} catch {
		// missing or corrupt cache: treat as absent
	}
	return null;
}

function writeCache(cache: UpdateCache): void {
	try {
		const dir = getConfigDir();
		if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
		writeFileSync(getCachePath(), JSON.stringify(cache, null, 2));
	} catch {
		// read-only home: the check simply runs again next time
	}
}

/** Latest release version from GitHub ("0.2.0"), or null on any failure. Never throws. */
export async function fetchLatestVersion(): Promise<string | null> {
	try {
		const res = await fetch(LATEST_RELEASE_URL, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': `theodo-blueprints-cli/${CLI_VERSION}`,
			},
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!res.ok) return null;
		const tag = extractTagName(await res.json());
		return tag ? normalizeVersion(tag) : null;
	} catch {
		return null;
	}
}

/** Latest known version: the daily cache when fresh, otherwise GitHub (falling back to the cache). */
async function getLatestVersion(): Promise<string | null> {
	const cache = readCache();
	const now = Date.now();
	if (cache !== null && !isCacheStale(cache, now)) return cache.latestVersion;
	const latest = await fetchLatestVersion();
	if (latest) writeCache({ lastCheckedAt: now, latestVersion: latest });
	return latest ?? cache?.latestVersion ?? null;
}

/**
 * Starts the passive update check. Call it before the command runs so the network
 * round-trip overlaps with the command; resolve it afterwards to get the notice (or null).
 */
export function startUpdateCheck(): Promise<string | null> {
	const enabled = isUpdateCheckEnabled({
		currentVersion: CLI_VERSION,
		env: process.env,
		isTTY: Boolean(process.stderr.isTTY),
	});
	if (!enabled) return Promise.resolve(null);
	return getLatestVersion().then((latest) =>
		latest && isNewerVersion(CLI_VERSION, latest)
			? formatUpdateNotice(CLI_VERSION, latest, process.platform)
			: null,
	);
}

export function printUpdateNotice(notice: string): void {
	console.error();
	console.error(chalk.yellow(notice));
}
