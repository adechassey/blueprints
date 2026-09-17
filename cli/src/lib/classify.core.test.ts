import { describe, expect, it } from 'vitest';
import { detectTechnologies, inferLayer, mergeTechnologies } from './classify.core.js';

describe('inferLayer', () => {
	it.each([
		// testing
		['src/area/area.service.test.ts', 'testing'],
		['src/__tests__/helpers.ts', 'testing'],
		['e2e/login.spec.tsx', 'testing'],
		// database
		['src/area/repository/area.repository.ts', 'database'],
		['src/area/repository/area.repository.type.ts', 'database'],
		['src/inbox/repository/inbox.adapter.ts', 'database'],
		['src/server/observations/repositories/findObservations.mapper.ts', 'database'],
		['src/server/observations/repositories/types.ts', 'database'],
		['prisma/apply-views.ts', 'database'],
		['db/schema.prisma', 'database'],
		// api
		['src/area/area.controller.ts', 'api'],
		['src/area/dto/area-create.dto.ts', 'api'],
		['src/features/localite/fetchLocaliteCandidates.action.ts', 'api'],
		['src/app/(app)/export/route.ts', 'api'],
		['src/app/api/health/handler.ts', 'api'],
		['src/auth/auth.guard.ts', 'api'],
		// state
		['src/cart/cart.store.ts', 'state'],
		['src/stores/session.ts', 'state'],
		// ui
		['src/features/ise/ClotureAboHeader.component.tsx', 'ui'],
		['src/app/(app)/ise/page.tsx', 'ui'],
		['src/features/print/usePrintCompte.ts', 'ui'],
		['src/core/activity/use-activity-lifecycle.ts', 'ui'],
		['src/hooks/format.ts', 'ui'],
		['src/auth/session.hook.ts', 'ui'],
		['src/App.vue', 'ui'],
		// infra
		['docker/Dockerfile', 'infra'],
		['compose.yaml', 'infra'],
		['infrastructure/main.tf', 'infra'],
		// tooling
		['vite.config.ts', 'tooling'],
		['scripts/seed.ts', 'tooling'],
		// domain
		['src/area/area.service.ts', 'domain'],
		['src/activity/activity-status.core.ts', 'domain'],
		['src/area/area.module.ts', 'domain'],
		['schemas/src/area.schema.ts', 'domain'],
		['src/features/ise/schemas.ts', 'domain'],
		['src/server/expedition/services/queueExpeditionPrinting.ts', 'domain'],
	])('infers %s → %s', (path, layer) => {
		expect(inferLayer(path, '')).toBe(layer);
	});

	it('prefers the exemplar path over the globs', () => {
		expect(inferLayer('src/area/area.controller.ts', 'src/**/*.service.ts')).toBe('api');
	});

	it('falls back to the globs, skipping exclusions, in declaration order', () => {
		expect(
			inferLayer('src/features/errorMessages.ts', '!**/*.test.ts, src/**/*.repository.ts'),
		).toBe('database');
	});

	it('is undefined when neither the path nor a glob matches a convention', () => {
		expect(inferLayer('src/features/errorMessages.ts', 'src/features/**/*.ts')).toBeUndefined();
	});
});

describe('detectTechnologies', () => {
	it('detects technologies from import specifiers', () => {
		const content = [
			"import { Injectable } from '@nestjs/common';",
			"import { BullModule } from '@nestjs/bullmq';",
			"import type { Prisma } from '@prisma/client';",
			"import { z } from 'zod';",
			"export * from 'drizzle-orm/pg-core';",
			"const oracledb = require('oracledb');",
			"const mod = await import('@opentelemetry/api');",
			"import './side-effect.css';",
			"import { helper } from '../helper.js';",
			"import { schema } from '@aquila-ap/schemas';",
		].join('\n');
		expect(detectTechnologies('src/area.service.ts', content)).toEqual([
			'TypeScript',
			'Nest.js',
			'BullMQ',
			'Prisma',
			'Zod',
			'Drizzle ORM',
			'Oracle Database',
			'OpenTelemetry',
		]);
	});

	it('detects React from the file extension and Next.js from a directive', () => {
		expect(
			detectTechnologies('src/Page.tsx', "'use client';\n\nexport function Page() {}"),
		).toEqual(['TypeScript', 'React', 'Next.js']);
		expect(detectTechnologies('src/widget.jsx', '')).toEqual(['React']);
	});

	it('detects nothing in a plain JavaScript file without known imports', () => {
		expect(detectTechnologies('scripts/run.js', "import fs from 'node:fs';")).toEqual([]);
	});

	it.each([
		["from 'react-dom/client'", 'React'],
		["from 'next/navigation'", 'Next.js'],
		["from 'nestjs-zod'", 'Zod'],
		["from 'openapi-react-query'", 'TanStack Query'],
		["from '@tanstack/react-router'", 'TanStack Router'],
		["from '@tanstack/react-form'", 'TanStack Form'],
		["from '@tanstack/react-table'", 'TanStack Table'],
		["from 'kysely'", 'Kysely'],
		["from 'hono/factory'", 'Hono'],
		["from '@thallesp/nestjs-better-auth'", 'Better Auth'],
		["from '@react-email/components'", 'React Email'],
		["from 'radix-ui'", 'Radix UI'],
		["from '@base-ui/react/select'", 'Base UI'],
		["from 'vitest'", 'Vitest'],
		["from '@playwright/test'", 'Playwright'],
	])('maps %s to %s', (statement, technology) => {
		expect(detectTechnologies('x.js', `import x ${statement};`)).toEqual([technology]);
	});
});

describe('mergeTechnologies', () => {
	it('appends explicit technologies without case-insensitive duplicates, keeping casing', () => {
		expect(
			mergeTechnologies(['TypeScript', 'React'], [' react ', 'Next.js', '', 'next.js']),
		).toEqual(['TypeScript', 'React', 'Next.js']);
	});
});
