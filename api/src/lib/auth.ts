import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg' }),
	basePath: '/api/auth',
	socialProviders: {
		google: {
			// biome-ignore lint/style/noNonNullAssertion: env vars required at startup
			clientId: process.env.GOOGLE_CLIENT_ID!,
			// biome-ignore lint/style/noNonNullAssertion: env vars required at startup
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'user',
				input: false,
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
