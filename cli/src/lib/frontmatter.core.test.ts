import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from './frontmatter.core.js';

describe('parseFrontmatter', () => {
	it('parses complete frontmatter', () => {
		const raw = `---
name: Test Blueprint
description: A test
usage: Use it
technologies: [hono, drizzle]
layer: api
tags: [nestjs, typescript]
---

# Content`;

		const { meta, content } = parseFrontmatter(raw);
		expect(meta.name).toBe('Test Blueprint');
		expect(meta.description).toBe('A test');
		expect(meta.usage).toBe('Use it');
		expect(meta.technologies).toEqual(['hono', 'drizzle']);
		expect(meta.layer).toBe('api');
		expect(meta.tags).toEqual(['nestjs', 'typescript']);
		expect(content).toBe('# Content');
	});

	it('handles missing frontmatter', () => {
		const { meta, content } = parseFrontmatter('Just content');
		expect(meta).toEqual({});
		expect(content).toBe('Just content');
	});

	it('parses project field separately from technologies', () => {
		const raw = `---
project: my-team
technologies: [react]
---

Content`;
		const { meta } = parseFrontmatter(raw);
		expect(meta.project).toBe('my-team');
		expect(meta.technologies).toEqual(['react']);
	});

	it('parses project field without technologies', () => {
		const raw = `---
project: backend-team
---

Content`;
		const { meta } = parseFrontmatter(raw);
		expect(meta.project).toBe('backend-team');
		expect(meta.technologies).toBeUndefined();
	});

	it('handles lines without colons', () => {
		const raw = `---
name: Valid
no-colon-line
---

Content`;
		const { meta } = parseFrontmatter(raw);
		expect(meta.name).toBe('Valid');
	});

	it('handles empty tags', () => {
		const raw = `---
tags: []
---

Content`;
		const { meta } = parseFrontmatter(raw);
		expect(meta.tags).toEqual([]);
	});
});
