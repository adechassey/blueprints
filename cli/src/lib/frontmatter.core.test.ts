import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from './frontmatter.core.js';

describe('parseFrontmatter', () => {
	it('parses complete frontmatter', () => {
		const raw = `---
name: Test Blueprint
description: A test
usage: Use it
stack: server
layer: service
tags: [nestjs, typescript]
---

# Content`;

		const { meta, content } = parseFrontmatter(raw);
		expect(meta.name).toBe('Test Blueprint');
		expect(meta.description).toBe('A test');
		expect(meta.usage).toBe('Use it');
		expect(meta.stack).toBe('server');
		expect(meta.layer).toBe('service');
		expect(meta.tags).toEqual(['nestjs', 'typescript']);
		expect(content).toBe('# Content');
	});

	it('handles missing frontmatter', () => {
		const { meta, content } = parseFrontmatter('Just content');
		expect(meta).toEqual({});
		expect(content).toBe('Just content');
	});

	it('handles project as alias for stack', () => {
		const raw = `---
project: webapp
---

Content`;
		const { meta } = parseFrontmatter(raw);
		expect(meta.stack).toBe('webapp');
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
