import { getTableColumns } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import {
	blueprintProjects,
	blueprintStack,
	blueprints,
	blueprintTags,
	blueprintVersions,
	comments,
	projectMembers,
	projects,
	tags,
	userRole,
	users,
} from '../schema.js';

describe('schema tables', () => {
	it('exports all 9 tables', () => {
		expect(users).toBeDefined();
		expect(projects).toBeDefined();
		expect(projectMembers).toBeDefined();
		expect(blueprints).toBeDefined();
		expect(blueprintProjects).toBeDefined();
		expect(blueprintVersions).toBeDefined();
		expect(tags).toBeDefined();
		expect(blueprintTags).toBeDefined();
		expect(comments).toBeDefined();
	});

	it('users table has expected columns', () => {
		const cols = Object.keys(getTableColumns(users));
		expect(cols).toEqual(
			expect.arrayContaining(['id', 'email', 'name', 'image', 'role', 'createdAt', 'updatedAt']),
		);
	});

	it('blueprints table has expected columns (no projectId)', () => {
		const cols = Object.keys(getTableColumns(blueprints));
		expect(cols).toEqual(
			expect.arrayContaining([
				'id',
				'name',
				'slug',
				'description',
				'usage',
				'currentVersionId',
				'authorId',
				'stack',
				'layer',
				'isPublic',
				'downloadCount',
				'createdAt',
				'updatedAt',
			]),
		);
		expect(cols).not.toContain('projectId');
	});

	it('blueprint_versions table has embedding column', () => {
		const cols = Object.keys(getTableColumns(blueprintVersions));
		expect(cols).toContain('embedding');
	});

	it('project_members table has expected columns', () => {
		const cols = Object.keys(getTableColumns(projectMembers));
		expect(cols).toEqual(expect.arrayContaining(['id', 'projectId', 'userId', 'role', 'joinedAt']));
	});

	it('blueprint_projects table has expected columns', () => {
		const cols = Object.keys(getTableColumns(blueprintProjects));
		expect(cols).toEqual(
			expect.arrayContaining(['blueprintId', 'projectId', 'addedBy', 'addedAt']),
		);
	});
});

describe('schema enums', () => {
	it('userRole has expected values', () => {
		expect(userRole.enumValues).toEqual(['admin', 'maintainer', 'user']);
	});

	it('blueprintStack has expected values', () => {
		expect(blueprintStack.enumValues).toEqual(['server', 'webapp', 'shared', 'fullstack']);
	});
});
