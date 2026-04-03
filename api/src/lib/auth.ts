import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { isDefaultAdmin } from './admin.core.js';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.users,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	basePath: '/api/auth',
	trustedOrigins: [
		process.env.CORS_ORIGIN || 'http://localhost:5173',
		'http://localhost:5174',
		'https://blueprints-webapp-*-adechasseys-projects.vercel.app',
	],
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
	advanced: {
		cookiePrefix: 'blueprints',
		defaultCookieAttributes: {
			sameSite: 'none',
			secure: true,
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
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					if (user.email && isDefaultAdmin(user.email)) {
						return { data: { ...user, role: 'admin' } };
					}
					return { data: user };
				},
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
