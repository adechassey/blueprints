/**
 * Pure classification of a blueprint exemplar: architecture layer from its
 * file path, technologies from its imports.
 * No I/O — 100% test coverage required.
 */
import type { BlueprintLayer } from '@blueprints/shared';

/** A JS/TS module extension, optionally prefixed by `c`/`m`. */
const JS = String.raw`\.[cm]?[jt]s`;

/**
 * Path conventions per layer, checked in order: tests first (a
 * `*.service.test.ts` exemplar is a testing pattern), then the conventions
 * that also end in `.ts`/`.tsx` before the generic UI extension rule.
 */
const LAYER_PATH_RULES: Array<[RegExp, BlueprintLayer]> = [
	[new RegExp(String.raw`\.(test|spec|e2e-spec)${JS}x?$|(^|[\\/])(__tests__|e2e)[\\/]`), 'testing'],
	[
		new RegExp(
			String.raw`\.(repository|adapter|mapper|entity)(\.type)?${JS}$|(^|[\\/])(repository|repositories|migrations|prisma)[\\/]|\.(sql|prisma)$`,
		),
		'database',
	],
	[
		new RegExp(
			String.raw`\.(controller|middleware|guard|interceptor|resolver|dto|action)${JS}$|[\\/]app[\\/]api[\\/]|(^|[\\/])route${JS}$`,
		),
		'api',
	],
	[new RegExp(String.raw`\.(store|slice)${JS}x?$|(^|[\\/])stores?[\\/]`), 'state'],
	[
		new RegExp(
			String.raw`\.[jt]sx$|\.(vue|svelte)$|(^|[\\/])(components|pages|hooks)[\\/]|(^|[\\/])use[A-Z-][^\\/]*${JS}$|\.hook${JS}$`,
		),
		'ui',
	],
	[
		/(^|[\\/])(Dockerfile|docker-compose[^\\/]*|compose\.ya?ml)$|\.tf$|(^|[\\/])(infra|infrastructure|\.github)[\\/]/,
		'infra',
	],
	[new RegExp(String.raw`\.config${JS}$|(^|[\\/])(scripts|tools)[\\/]`), 'tooling'],
	[
		new RegExp(
			String.raw`\.(service|core|error|module|schema|constant|util|handler)${JS}$|(^|[\\/])schemas?(${JS}$|[\\/])|(^|[\\/])(services|domain)[\\/]`,
		),
		'domain',
	],
];

function layerOfPath(path: string): BlueprintLayer | undefined {
	return LAYER_PATH_RULES.find(([pattern]) => pattern.test(path))?.[1];
}

/**
 * Infers the architecture layer of a blueprint: from its exemplar file path
 * first (the concrete file), then from its globs in declaration order
 * (exclusion globs skipped). Undefined when no convention matches — the
 * caller decides the fallback and reports it, rather than silently filing
 * the blueprint under a default layer.
 */
export function inferLayer(path: string, globs: string): BlueprintLayer | undefined {
	const candidates = [
		path,
		...globs
			.split(',')
			.map((glob) => glob.trim())
			.filter((glob) => glob !== '' && !glob.startsWith('!')),
	];
	for (const candidate of candidates) {
		const layer = layerOfPath(candidate);
		if (layer) return layer;
	}
	return undefined;
}

/**
 * Import specifiers → technology display names. Names match the registry's
 * technology catalog, which resolves them by name (case-insensitive) or slug.
 */
const TECHNOLOGY_IMPORT_RULES: Array<[RegExp, string]> = [
	[/^react(-dom)?(\/|$)/, 'React'],
	[/^next(\/|$)/, 'Next.js'],
	[/^@nestjs\//, 'Nest.js'],
	[/^(@prisma\/client|prisma)(\/|$)/, 'Prisma'],
	[/^(zod|nestjs-zod)(\/|$)/, 'Zod'],
	[/^(@tanstack\/react-query|openapi-react-query)(\/|$)/, 'TanStack Query'],
	[/^@tanstack\/react-router(\/|$)/, 'TanStack Router'],
	[/^@tanstack\/react-form(\/|$)/, 'TanStack Form'],
	[/^@tanstack\/react-table(\/|$)/, 'TanStack Table'],
	[/^drizzle-orm(\/|$)/, 'Drizzle ORM'],
	[/^kysely(\/|$)/, 'Kysely'],
	[/^(oracledb|kysely-oracledb)(\/|$)/, 'Oracle Database'],
	[/^hono(\/|$)/, 'Hono'],
	[/^(bullmq|@nestjs\/bullmq)(\/|$)/, 'BullMQ'],
	[/^(better-auth(\/|$)|@thallesp\/nestjs-better-auth)/, 'Better Auth'],
	[/^@opentelemetry\//, 'OpenTelemetry'],
	[/^(@react-email\/|react-email(\/|$))/, 'React Email'],
	[/^(radix-ui(\/|$)|@radix-ui\/)/, 'Radix UI'],
	[/^@base-ui\/react(\/|$)/, 'Base UI'],
	[/^vitest(\/|$)/, 'Vitest'],
	[/^@playwright\/test(\/|$)/, 'Playwright'],
];

/** `from 'x'`, `import 'x'`, `import('x')`, `require('x')`. */
const IMPORT_SPECIFIER_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"]([^'"\n]+)['"]/g;

/** A `'use client'` / `'use server'` directive: a Next.js React Server Components file. */
const RSC_DIRECTIVE_RE = /^\s*['"]use (client|server)['"];?\s*$/m;

/**
 * Technologies an exemplar file demonstrates, from its extension (TypeScript,
 * React for `.tsx`/`.jsx`), its React Server Components directives (Next.js)
 * and its import specifiers. Relative and workspace imports match nothing.
 * Returned in a stable order without duplicates.
 */
export function detectTechnologies(path: string, content: string): string[] {
	const found = new Set<string>();
	if (/\.[cm]?tsx?$/.test(path)) found.add('TypeScript');
	if (/\.[jt]sx$/.test(path)) found.add('React');
	if (RSC_DIRECTIVE_RE.test(content)) found.add('Next.js');

	for (const [, specifier] of content.matchAll(IMPORT_SPECIFIER_RE)) {
		for (const [pattern, technology] of TECHNOLOGY_IMPORT_RULES) {
			if (pattern.test(specifier as string)) found.add(technology);
		}
	}
	return [...found];
}

/**
 * Detected technologies plus the ones passed explicitly (`--techno`), without
 * case-insensitive duplicates. Casing is kept: the registry creates unknown
 * technologies under the name it receives.
 */
export function mergeTechnologies(detected: string[], explicit: string[]): string[] {
	const byKey = new Map<string, string>();
	for (const technology of [...detected, ...explicit]) {
		const name = technology.trim();
		const key = name.toLowerCase();
		if (name && !byKey.has(key)) byKey.set(key, name);
	}
	return [...byKey.values()];
}
