import {
	boolean,
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

// Enums
export const userRole = pgEnum('user_role', ['admin', 'maintainer', 'user']);
export const blueprintStack = pgEnum('blueprint_stack', [
	'server',
	'webapp',
	'shared',
	'fullstack',
]);

// Users
export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	image: text('image'),
	role: userRole('role').notNull().default('user'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// Projects
export const projects = pgTable('projects', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	createdBy: uuid('created_by')
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
		slug: text('slug').notNull(),
		description: text('description'),
		usage: text('usage'),
		currentVersionId: uuid('current_version_id'),
		projectId: uuid('project_id').references(() => projects.id),
		authorId: uuid('author_id')
			.notNull()
			.references(() => users.id),
		stack: blueprintStack('stack').notNull(),
		layer: text('layer').notNull(),
		isPublic: boolean('is_public').notNull().default(true),
		downloadCount: integer('download_count').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(t) => [unique('blueprints_project_slug').on(t.projectId, t.slug)],
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
	authorId: uuid('author_id')
		.notNull()
		.references(() => users.id),
	embedding: vector('embedding', { dimensions: 384 }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Tags
export const tags = pgTable('tags', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

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
	authorId: uuid('author_id')
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
