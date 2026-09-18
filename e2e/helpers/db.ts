import { execSync } from 'node:child_process';
import { URL } from 'node:url';
import pg from 'pg';

/**
 * Shared constants for the E2E suite. The API server must run with the same
 * values — they are set in playwright.config.ts (webServer.env) and reused here.
 */
const E2E_DB_URL =
	process.env.E2E_DATABASE_URL ??
	'postgresql://blueprints:blueprints@localhost:5433/blueprints_e2e';

export const E2E_AUTH_SECRET = 'e2e-secret-for-tests-only';
export const SESSION_COOKIE_NAME = 'blueprints.session_token';

/**
 * Creates the E2E database if it does not exist and applies Drizzle migrations.
 * Runs once before all tests (playwright globalSetup).
 */
export async function setupDatabase(): Promise<void> {
	const dbName = new URL(E2E_DB_URL).pathname.slice(1);
	const adminUrl = new URL(E2E_DB_URL);
	adminUrl.pathname = '/postgres';

	const pool = new pg.Pool({ connectionString: adminUrl.href });
	const exists = await pool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
	if (exists.rowCount === 0) {
		await pool.query(`CREATE DATABASE "${dbName}"`);
	}
	await pool.end();

	// Apply migrations against the test database (inline env var overrides the
	// root .env, and dotenv never overrides process.env — safe in both setups)
	execSync('pnpm --filter api db:migrate', {
		env: { ...process.env, DATABASE_URL: E2E_DB_URL },
		stdio: 'inherit',
	});
}

/** Runs an SQL query against the E2E database. */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
	sql: string,
	params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
	const pool = new pg.Pool({ connectionString: E2E_DB_URL });
	try {
		return await pool.query<T>(sql, params);
	} finally {
		await pool.end();
	}
}

export interface TestUser {
	id: string;
	name: string;
	email: string;
	token: string;
}

/**
 * Creates a user + a live Better Auth session row (random token) and returns
 * the user. The session token must be signed into a cookie to authenticate —
 * see helpers/auth.ts.
 */
export async function createTestUser(
	name: string,
	role: 'admin' | 'maintainer' | 'user' = 'user',
): Promise<TestUser> {
	const id = `e2e-${crypto.randomUUID()}`;
	const email = `${id}@e2e.local`;
	const token = `e2e-token-${crypto.randomUUID()}`;

	await query(
		`INSERT INTO users (id, name, email, "emailVerified", role)
		 VALUES ($1, $2, $3, true, $4)`,
		[id, name, email, role],
	);
	await query(
		`INSERT INTO session (id, "expiresAt", token, "userId")
		 VALUES ($1, now() + interval '1 day', $2, $3)`,
		[`e2e-session-${id}`, token, id],
	);

	return { id, name, email, token };
}

/** Deletes every E2E-generated user (sessions/blueprints/comments cascade). */
export async function cleanupE2eData(): Promise<void> {
	// Ordered by FK dependencies (no ON DELETE cascade everywhere).
	// The 'E2E ' name prefix also purges orphans left by interrupted runs.
	await query(
		`DELETE FROM stacks WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`,
	);
	await query(
		`DELETE FROM comments WHERE blueprint_id IN (SELECT id FROM blueprints WHERE name LIKE 'E2E %')`,
	);
	await query(
		`DELETE FROM blueprint_versions WHERE blueprint_id IN (SELECT id FROM blueprints WHERE name LIKE 'E2E %')`,
	);
	await query(
		`DELETE FROM blueprint_tags WHERE blueprint_id IN (SELECT id FROM blueprints WHERE name LIKE 'E2E %')`,
	);
	await query(
		`DELETE FROM blueprint_projects WHERE blueprint_id IN (SELECT id FROM blueprints WHERE name LIKE 'E2E %')`,
	);
	await query(`DELETE FROM blueprints WHERE name LIKE 'E2E %'`);
	await query(
		`DELETE FROM comments WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`,
	);
	await query(
		`DELETE FROM blueprint_versions WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`,
	);
	await query(
		`DELETE FROM blueprint_tags WHERE blueprint_id IN (SELECT id FROM blueprints WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%@e2e.local'))`,
	);
	await query(
		`DELETE FROM blueprint_projects WHERE blueprint_id IN (SELECT id FROM blueprints WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%@e2e.local'))`,
	);
	await query(
		`DELETE FROM blueprints WHERE author_id IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`,
	);
	await query(
		`DELETE FROM projects WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`,
	);
	await query(`DELETE FROM users WHERE email LIKE '%@e2e.local'`);
	// Technologies created on the fly by E2E writes (links cascade)
	await query(`DELETE FROM technologies WHERE slug LIKE 'e2e-%'`);
}

interface SeededBlueprint {
	id: string;
	name: string;
	slug: string;
}

/**
 * The project owning a user's seeded blueprints, created on first use: every
 * blueprint belongs to exactly one project.
 */
export async function seedProject(userId: string): Promise<{ id: string; slug: string }> {
	const slug = `e2e-project-${userId.slice(-12)}`;
	const existing = await query<{ id: string; slug: string }>(
		'SELECT id, slug FROM projects WHERE slug = $1',
		[slug],
	);
	if (existing.rows[0]) return existing.rows[0];

	const created = await query<{ id: string; slug: string }>(
		`INSERT INTO projects (name, slug, description, created_by)
		 VALUES ($1, $2, 'Seeded by the E2E suite', $3) RETURNING id, slug`,
		[`E2E Project ${userId.slice(-12)}`, slug, userId],
	);
	await query(`INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`, [
		created.rows[0].id,
		userId,
	]);
	return created.rows[0];
}

/** Inserts a blueprint + initial version directly (bypasses the API). */
export async function seedBlueprint(
	authorId: string,
	{
		name,
		description,
		content,
		layer = 'ui',
		projectId,
	}: {
		name: string;
		description: string;
		content: string;
		layer?: string;
		projectId?: string;
	},
): Promise<SeededBlueprint> {
	// Random suffix avoids unique-constraint collisions across runs
	const slug = `e2e-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomUUID().slice(0, 8)}`;
	const owningProjectId = projectId ?? (await seedProject(authorId)).id;
	const blueprintResult = await query<{ id: string; name: string; slug: string }>(
		`INSERT INTO blueprints (name, slug, description, usage, author_id, layer, project_id)
		 VALUES ($1, $2, $3, 'Use when testing', $4, $5, $6)
		 RETURNING id, name, slug`,
		[name, slug, description, authorId, layer, owningProjectId],
	);
	await query(
		`INSERT INTO blueprint_projects (blueprint_id, project_id, added_by) VALUES ($1, $2, $3)`,
		[blueprintResult.rows[0].id, owningProjectId, authorId],
	);
	const versionResult = await query<{ id: string }>(
		`INSERT INTO blueprint_versions (blueprint_id, version, content, author_id)
		 VALUES ($1, 1, $2, $3) RETURNING id`,
		[blueprintResult.rows[0].id, content, authorId],
	);
	await query(`UPDATE blueprints SET current_version_id = $1 WHERE id = $2`, [
		versionResult.rows[0].id,
		blueprintResult.rows[0].id,
	]);
	return blueprintResult.rows[0];
}
