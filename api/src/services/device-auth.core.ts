/**
 * Pure functions for the OAuth device authorization flow.
 * No I/O — 100% test coverage required.
 */

const USER_CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXZ';
const USER_CODE_LENGTH = 8; // formatted as XXXX-XXXX

export type PollingResult =
	| { status: 'approved'; token: string }
	| { status: 'authorization_pending' }
	| { status: 'slow_down' }
	| { status: 'expired_token' }
	| { status: 'access_denied' };

export type DeviceRequestStatus = 'pending' | 'approved' | 'denied';

export function generateUserCode(): string {
	let code = '';
	for (let i = 0; i < USER_CODE_LENGTH; i++) {
		code += USER_CODE_ALPHABET[Math.floor(Math.random() * USER_CODE_ALPHABET.length)];
	}
	return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export function isValidUserCode(userCode: string): boolean {
	const unformatted = userCode.replace('-', '');
	if (unformatted.length !== USER_CODE_LENGTH) return false;
	for (const char of unformatted) {
		if (!USER_CODE_ALPHABET.includes(char)) return false;
	}
	return true;
}

/**
 * Maps a device request's stored state to the RFC 8628 polling response.
 * @param minIntervalSeconds minimum interval the client must respect
 * @param lastPollSecondsAgo seconds since the client's previous poll (-1 on first poll)
 */
export function resolvePollingResult(
	status: DeviceRequestStatus,
	token: string | null,
	expiresAt: Date | string,
	now: Date = new Date(),
	minIntervalSeconds = 2,
	lastPollSecondsAgo = Number.POSITIVE_INFINITY,
): PollingResult {
	const expires = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
	if (now >= expires) return { status: 'expired_token' };
	if (status === 'denied') return { status: 'access_denied' };
	if (status === 'approved' && token) return { status: 'approved', token };
	if (lastPollSecondsAgo < minIntervalSeconds) return { status: 'slow_down' };
	return { status: 'authorization_pending' };
}
