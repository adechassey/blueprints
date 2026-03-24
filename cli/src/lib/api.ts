import type { AppType } from 'api/app';
import { hc } from 'hono/client';
import { getConfig } from './config.js';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export function createApiClient() {
	const config = getConfig();
	return hc<AppType>(config.server, {
		headers: config.token ? { Authorization: `Bearer ${config.token}` } : {},
	});
}

type JSONResponse<T> = T extends { json(): Promise<infer R> } ? R : never;

export async function unwrapResponse<T extends Response>(res: T): Promise<JSONResponse<T>> {
	if (res.status === 401) {
		throw new ApiError(401, 'Session expired or invalid. Please run: theodo-blueprints auth login');
	}

	if (!res.ok) {
		const text = await res.text();
		let message = res.statusText;
		try {
			const body = JSON.parse(text);
			if (body.error) message = body.error;
		} catch {
			// use statusText
		}
		throw new ApiError(res.status, message);
	}

	return res.json() as Promise<JSONResponse<T>>;
}
