import { describe, expect, it } from 'vitest';
import {
	AmbiguousSlugError,
	appendSlugSuffix,
	generateSlug,
	normalizeTagName,
	pickSlug,
	pickSlugCandidate,
	type SlugCandidate,
	SlugConflictError,
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

describe('pickSlug', () => {
	it('keeps the requested slug when it is free', () => {
		expect(
			pickSlug({
				requested: 'form-field',
				explicit: true,
				taken: false,
				projectLabel: 'aquila-ap',
			}),
		).toBe('form-field');
	});

	it('suffixes a generated slug on collision', () => {
		expect(
			pickSlug({ requested: 'form-field', explicit: false, taken: true, projectLabel: null }),
		).toMatch(/^form-field-[a-z0-9]+$/);
	});

	it('rejects an explicit slug on collision, naming the project', () => {
		expect(() =>
			pickSlug({ requested: 'form-field', explicit: true, taken: true, projectLabel: 'aquila-ap' }),
		).toThrow(new SlugConflictError('form-field', 'aquila-ap'));
	});

	it('names the global namespace when there is no project', () => {
		const err = new SlugConflictError('form-field', null);
		expect(err.message).toBe('Slug "form-field" already exists in the global namespace');
		expect(err.status).toBe(409);
		expect(err.name).toBe('SlugConflictError');
	});
});

describe('pickSlugCandidate', () => {
	it('returns null when nothing matches', () => {
		expect(pickSlugCandidate('form-field', [])).toBeNull();
	});

	it('returns the single match', () => {
		const only = { id: 'a', projectSlugs: ['aquila-ap'] };
		expect(pickSlugCandidate('form-field', [only])).toBe(only);
	});

	it('throws an ambiguity error listing every namespace', () => {
		const candidates: SlugCandidate[] = [
			{ id: 'a', projectSlugs: ['aquila-ap'] },
			{ id: 'b', projectSlugs: [] },
			{ id: 'c', projectSlugs: ['x', 'y'] },
		];
		let caught: unknown;
		try {
			pickSlugCandidate('form-field', candidates);
		} catch (err) {
			caught = err;
		}
		expect(caught).toBeInstanceOf(AmbiguousSlugError);
		const err = caught as AmbiguousSlugError;
		expect(err.message).toBe(
			'Slug "form-field" exists in several namespaces (aquila-ap, global, x+y): pass project= to disambiguate',
		);
		expect(err.status).toBe(409);
		expect(err.name).toBe('AmbiguousSlugError');
		expect(err.candidates).toBe(candidates);
	});
});
