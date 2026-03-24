import { describe, expect, it } from 'vitest';
import {
	appendSlugSuffix,
	generateSlug,
	normalizeTagName,
	shouldCreateNewVersion,
} from './blueprints.core.js';

describe('generateSlug', () => {
	it('converts simple name to kebab-case', () => {
		expect(generateSlug('Hello World')).toBe('hello-world');
	});

	it('handles special characters', () => {
		expect(generateSlug('My Blueprint! @v2')).toBe('my-blueprint-v2');
	});

	it('handles unicode/accented characters', () => {
		expect(generateSlug('Café Résumé')).toBe('cafe-resume');
	});

	it('collapses multiple spaces and dashes', () => {
		expect(generateSlug('hello   world---test')).toBe('hello-world-test');
	});

	it('trims leading/trailing whitespace', () => {
		expect(generateSlug('  trimmed  ')).toBe('trimmed');
	});

	it('truncates to 100 chars', () => {
		const longName = 'a'.repeat(200);
		expect(generateSlug(longName).length).toBe(100);
	});

	it('handles empty string', () => {
		expect(generateSlug('')).toBe('');
	});
});

describe('normalizeTagName', () => {
	it('lowercases tag', () => {
		expect(normalizeTagName('NestJS')).toBe('nestjs');
	});

	it('trims whitespace', () => {
		expect(normalizeTagName('  react  ')).toBe('react');
	});
});

describe('appendSlugSuffix', () => {
	it('appends a base36 timestamp suffix', () => {
		const result = appendSlugSuffix('my-blueprint');
		expect(result).toMatch(/^my-blueprint-[a-z0-9]+$/);
	});

	it('returns a different slug than the original', () => {
		expect(appendSlugSuffix('test')).not.toBe('test');
	});

	it('handles empty slug', () => {
		const result = appendSlugSuffix('');
		expect(result).toMatch(/^-[a-z0-9]+$/);
	});
});

describe('shouldCreateNewVersion', () => {
	it('returns false when newContent is undefined', () => {
		expect(shouldCreateNewVersion('old', undefined)).toBe(false);
	});

	it('returns true when existingContent is null', () => {
		expect(shouldCreateNewVersion(null, 'new')).toBe(true);
	});

	it('returns true when content changed', () => {
		expect(shouldCreateNewVersion('old', 'new')).toBe(true);
	});

	it('returns false when content is identical', () => {
		expect(shouldCreateNewVersion('same', 'same')).toBe(false);
	});
});
