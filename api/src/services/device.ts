import { randomBytes, randomUUID } from 'node:crypto';
import { and, eq, lt } from 'drizzle-orm';
import type { DB } from '../db/index.js';
import { deviceAuthRequests, session } from '../db/schema.js';
import {
	type DeviceRequestStatus,
	generateUserCode,
	type PollingResult,
	resolvePollingResult,
} from './device-auth.core.js';

const REQUEST_TTL_SECONDS = 600; // 10 minutes to approve
const SESSION_TTL_DAYS = 30;

interface DeviceAuthRequest {
	deviceCode: string;
	userCode: string;
	verificationUri: string;
	expiresIn: number;
	interval: number;
}

export async function createDeviceAuthRequest(
	db: DB,
	verificationUri: string,
): Promise<DeviceAuthRequest> {
	// Retry on the (rare) user_code unique collision
	for (let attempt = 0; attempt < 5; attempt++) {
		const userCode = generateUserCode();
		const deviceCode = randomBytes(32).toString('hex');
		try {
			await db.insert(deviceAuthRequests).values({
				deviceCode,
				userCode,
				status: 'pending',
				expiresAt: new Date(Date.now() + REQUEST_TTL_SECONDS * 1000),
			});
			return {
				deviceCode,
				userCode,
				verificationUri,
				expiresIn: REQUEST_TTL_SECONDS,
				interval: 2,
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			if (!message.includes('device_auth_requests_user_code_unique') && attempt === 4) {
				throw err;
			}
		}
	}
	throw new Error('Failed to generate a unique user code');
}

export async function pollDeviceAuthRequest(
	db: DB,
	deviceCode: string,
	now: Date = new Date(),
): Promise<PollingResult> {
	await purgeExpiredDeviceAuthRequests(db);
	const [request] = await db
		.select()
		.from(deviceAuthRequests)
		.where(eq(deviceAuthRequests.deviceCode, deviceCode))
		.limit(1);

	if (!request) return { status: 'expired_token' };
	return resolvePollingResult(
		request.status as DeviceRequestStatus,
		request.token,
		request.expiresAt,
		now,
	);
}

export async function approveDeviceAuthRequest(
	db: DB,
	userCode: string,
	userId: string,
): Promise<boolean> {
	const normalized = userCode.trim().toUpperCase();
	const [request] = await db
		.select()
		.from(deviceAuthRequests)
		.where(
			and(eq(deviceAuthRequests.userCode, normalized), eq(deviceAuthRequests.status, 'pending')),
		)
		.limit(1);

	if (!request || new Date() >= request.expiresAt) return false;

	// Create a dedicated session so the CLI credential is revocable independently
	// of the browser session that approved it.
	const token = randomBytes(32).toString('hex');
	await db.insert(session).values({
		id: randomUUID(),
		token,
		userId,
		expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
	});

	await db
		.update(deviceAuthRequests)
		.set({ status: 'approved', token, userId })
		.where(eq(deviceAuthRequests.deviceCode, request.deviceCode));

	return true;
}

/** Housekeeping: remove expired requests. Called opportunistically. */
async function purgeExpiredDeviceAuthRequests(db: DB): Promise<void> {
	await db.delete(deviceAuthRequests).where(lt(deviceAuthRequests.expiresAt, new Date()));
}
