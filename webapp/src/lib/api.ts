import type { AppType } from 'api/app';
import { hc } from 'hono/client';
import { API_URL } from './config.js';

export const api = hc<AppType>(API_URL, {
	fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
});

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

type JSONResponse<T> = T extends { json(): Promise<infer R> } ? R : never;

export async function unwrapResponse<T extends Response>(res: T): Promise<JSONResponse<T>> {
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
