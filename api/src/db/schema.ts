import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
	vector,
} from 'drizzle-orm/pg-core';

export const projectMemberRole = pgEnum('project_member_role', ['owner', 'member']);

// Enums — values mirrored from BLUEPRINT_LAYERS / TECHNOLOGY_CATEGORIES in
// @blueprints/shared (inlined: drizzle-kit cannot resolve workspace sources)
export const userRole = pgEnum('user_role', ['admin', 'maintainer', 'user']);
export const blueprintLayer = pgEnum('blueprint_layer', [
	'database',
	'api',
	'domain',
	'ui',
	'state',
	'infra',
	'testing',
	'tooling',
]);
export const technologyCategory = pgEnum('technology_category', [
	'language',
	'framework',
	'library',
	'database',
	'infra',
	'tooling',
]);

// Users
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('emailVerified').notNull().default(false),
	name: text('name').notNull(),
	image: text('image'),
	role: userRole('role').notNull().default('user'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// Better Auth — sessions
export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
});

// Better Auth — accounts (OAuth providers)
export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
	refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
});

// Better Auth — verification tokens
export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
	createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

// Projects
export const projects = pgTable('projects', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	createdBy: text('created_by')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// Blueprints
export const blueprints = pgTable(
	'blueprints',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		// Unique within the owning project, never globally.
		slug: text('slug').notNull(),
		description: text('description'),
		usage: text('usage'),
		currentVersionId: uuid('current_version_id'),
		// The owning project: a blueprint records one team's pattern. Reuse across
		// projects is a fork (a copy), never a shared link.
		projectId: uuid('project_id')
			.notNull()
			.references((): AnyPgColumn => projects.id),
		// Set when the blueprint was forked from another project's blueprint
		forkedFromId: uuid('forked_from_id').references((): AnyPgColumn => blueprints.id, {
			onDelete: 'set null',
		}),
		authorId: text('author_id')
			.notNull()
			.references(() => users.id),
		// Architecture layer the blueprint belongs to (see BLUEPRINT_LAYERS)
		layer: blueprintLayer('layer').notNull(),
		// Origin of the blueprint, e.g. "owner/repo:path/to/file.ts:42" for a synced
		// `@Blueprint` code annotation
		source: text('source'),
		isPublic: boolean('is_public').notNull().default(true),
		downloadCount: integer('download_count').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [
		index('blueprints_slug_idx').on(t.slug),
		index('blueprints_project_idx').on(t.projectId),
		// Slugs are unique per owning project, never globally
		unique('blueprints_project_slug_unique').on(t.projectId, t.slug),
	],
);

// Blueprint versions
export const blueprintVersions = pgTable('blueprint_versions', {
	id: uuid('id').primaryKey().defaultRandom(),
	blueprintId: uuid('blueprint_id')
		.notNull()
		.references(() => blueprints.id),
	version: integer('version').notNull(),
	content: text('content').notNull(),
	changelog: text('changelog'),
	authorId: text('author_id')
		.notNull()
		.references(() => users.id),
	embedding: vector('embedding', { dimensions: 384 }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Project members
export const projectMembers = pgTable(
	'project_members',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: projectMemberRole('role').notNull().default('member'),
		joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [unique('project_members_unique').on(t.projectId, t.userId)],
);

// Tags
export const tags = pgTable('tags', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Technologies (curated taxonomy: frameworks, languages, libraries…)
export const technologies = pgTable('technologies', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	category: technologyCategory('category').notNull().default('library'),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Blueprint-Technology join table (many-to-many)
export const blueprintTechnologies = pgTable(
	'blueprint_technologies',
	{
		blueprintId: uuid('blueprint_id')
			.notNull()
			.references(() => blueprints.id, { onDelete: 'cascade' }),
		technologyId: uuid('technology_id')
			.notNull()
			.references((): AnyPgColumn => technologies.id, { onDelete: 'cascade' }),
	},
	(t) => [
		primaryKey({ columns: [t.blueprintId, t.technologyId] }),
		index('blueprint_technologies_technology_idx').on(t.technologyId),
	],
);

// Blueprint-Tag join table
export const blueprintTags = pgTable(
	'blueprint_tags',
	{
		blueprintId: uuid('blueprint_id')
			.notNull()
			.references(() => blueprints.id),
		tagId: uuid('tag_id')
			.notNull()
			.references(() => tags.id),
	},
	(t) => [primaryKey({ columns: [t.blueprintId, t.tagId] })],
);

// Comments
export const comments = pgTable('comments', {
	id: uuid('id').primaryKey().defaultRandom(),
	blueprintId: uuid('blueprint_id')
		.notNull()
		.references(() => blueprints.id),
	authorId: text('author_id')
		.notNull()
		.references(() => users.id),
	parentId: uuid('parent_id'),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// Blueprint matches
export const matchStatus = pgEnum('match_status', ['possible', 'confirmed', 'dismissed']);

export const blueprintMatches = pgTable(
	'blueprint_matches',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		blueprintId: uuid('blueprint_id')
			.notNull()
			.references(() => blueprints.id, { onDelete: 'cascade' }),
		matchedBlueprintId: uuid('matched_blueprint_id')
			.notNull()
			.references(() => blueprints.id, { onDelete: 'cascade' }),
		reason: text('reason').notNull(),
		score: integer('score'),
		status: matchStatus('status').notNull().default('possible'),
		reviewedBy: text('reviewed_by').references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [unique('blueprint_matches_pair').on(t.blueprintId, t.matchedBlueprintId)],
);

// Device authorization flow (CLI login)
export const deviceAuthRequests = pgTable('device_auth_requests', {
	deviceCode: text('device_code').primaryKey(),
	userCode: text('user_code').notNull().unique(),
	status: text('status').notNull().default('pending'),
	token: text('token'),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
