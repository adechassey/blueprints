import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { API_URL } from './config.js';

export const authClient = createAuthClient({
	baseURL: API_URL,
	basePath: '/api/auth',
	plugins: [
		inferAdditionalFields({
			user: {
				role: {
					type: 'string',
				},
			},
		}),
	],
});
