import { getTableColumns } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import {
	blueprintStack,
	blueprints,
	blueprintTags,
	blueprintVersions,
	comments,
	projects,
	tags,
	userRole,
	users,
} from '../schema.js';

describe('schema tables', () => {
	it('exports all 7 tables', () => {
		expect(users).toBeDefined();
		expect(projects).toBeDefined();
		expect(blueprints).toBeDefined();
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

	it('blueprints table has expected columns', () => {
		const cols = Object.keys(getTableColumns(blueprints));
		expect(cols).toEqual(
			expect.arrayContaining([
				'id',
				'name',
				'slug',
				'description',
				'usage',
				'currentVersionId',
				'projectId',
				'authorId',
				'stack',
				'layer',
				'isPublic',
				'downloadCount',
				'createdAt',
				'updatedAt',
			]),
		);
	});

	it('blueprint_versions table has embedding column', () => {
		const cols = Object.keys(getTableColumns(blueprintVersions));
		expect(cols).toContain('embedding');
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
