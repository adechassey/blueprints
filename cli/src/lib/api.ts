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

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
	const config = getConfig();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options?.headers as Record<string, string>),
	};

	if (config.token) {
		headers.Authorization = `Bearer ${config.token}`;
	}

	const res = await fetch(`${config.server}/api${path}`, {
		...options,
		headers,
	});

	if (res.status === 401) {
		throw new ApiError(401, 'Session expired or invalid. Please run: theodo-blueprints auth login');
	}

	if (!res.ok) {
		const body = await res.json().catch(() => ({ error: res.statusText }));
		throw new ApiError(res.status, (body as { error: string }).error || res.statusText);
	}

	return res.json() as Promise<T>;
}
