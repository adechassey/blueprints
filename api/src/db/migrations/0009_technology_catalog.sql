-- Curated technology catalog: display names and categories for the
-- technologies the CLI detects in exemplar files. Blueprint writes resolve a
-- reference by slug or by name (case-insensitive), so synced blueprints link
-- to these rows instead of creating lowercase, uncategorized duplicates.
INSERT INTO "technologies" ("name", "slug", "category") VALUES
	('TypeScript', 'typescript', 'language'),
	('Python', 'python', 'language'),
	('React', 'react', 'framework'),
	('Next.js', 'nextjs', 'framework'),
	('Nest.js', 'nestjs', 'framework'),
	('Hono', 'hono', 'framework'),
	('TanStack Router', 'tanstack-router', 'library'),
	('TanStack Query', 'tanstack-query', 'library'),
	('TanStack Form', 'tanstack-form', 'library'),
	('TanStack Table', 'tanstack-table', 'library'),
	('Tailwind CSS', 'tailwindcss', 'library'),
	('Zod', 'zod', 'library'),
	('Radix UI', 'radix-ui', 'library'),
	('Base UI', 'base-ui', 'library'),
	('Better Auth', 'better-auth', 'library'),
	('React Email', 'react-email', 'library'),
	('BullMQ', 'bullmq', 'library'),
	('Prisma', 'prisma', 'database'),
	('Drizzle ORM', 'drizzle', 'database'),
	('Kysely', 'kysely', 'database'),
	('PostgreSQL', 'postgresql', 'database'),
	('Oracle Database', 'oracle-database', 'database'),
	('SQL Server', 'sql-server', 'database'),
	('Node.js', 'node', 'infra'),
	('Docker', 'docker', 'infra'),
	('OpenTelemetry', 'opentelemetry', 'infra'),
	('Vite', 'vite', 'tooling'),
	('Vitest', 'vitest', 'tooling'),
	('Playwright', 'playwright', 'tooling')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "category" = EXCLUDED."category";
