import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/index.js';
import { getUser, requireAuth } from '../middleware/auth.js';
import {
	approveDeviceAuthRequest,
	createDeviceAuthRequest,
	pollDeviceAuthRequest,
} from '../services/device.js';

const pollRequestSchema = z.object({ device_code: z.string() });
const approveRequestSchema = z.object({ user_code: z.string() });

export const deviceRoutes = new Hono()
	// NOTE: must be registered before the Better Auth catch-all on /api/auth/*
	.post('/auth/device/code', async (c) => {
		const origin = process.env.CORS_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:5173';
		const request = await createDeviceAuthRequest(db, `${origin}/device`);
		return c.json({
			device_code: request.deviceCode,
			user_code: request.userCode,
			verification_uri: request.verificationUri,
			expires_in: request.expiresIn,
			interval: request.interval,
		});
	})
	.post('/auth/device/token', zValidator('json', pollRequestSchema), async (c) => {
		const { device_code } = c.req.valid('json');
		const result = await pollDeviceAuthRequest(db, device_code);
		if (result.status === 'approved') {
			return c.json({ access_token: result.token, token_type: 'bearer' });
		}
		return c.json({ error: result.status }, 400);
	})
	.post(
		'/auth/device/approve',
		requireAuth,
		zValidator('json', approveRequestSchema),
		async (c) => {
			const { user_code } = c.req.valid('json');
			const user = getUser(c);
			const approved = await approveDeviceAuthRequest(db, user_code, user.id);
			if (!approved) {
				return c.json({ error: 'Invalid or expired code' }, 400);
			}
			return c.json({ success: true });
		},
	);
