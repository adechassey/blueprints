import { describe, expect, it } from 'vitest';
import { parseBlueprintMarkdown } from './frontmatter.core.js';

describe('parseBlueprintMarkdown', () => {
	it('parses complete frontmatter', () => {
		const raw = `---
name: My Blueprint
description: A test blueprint
usage: Use it wisely
technologies: [nestjs, typescript]
layer: service
tags: [api, auth]
---

# Content here

Some markdown content.`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta).toEqual({
			name: 'My Blueprint',
			description: 'A test blueprint',
			usage: 'Use it wisely',
			technologies: ['nestjs', 'typescript'],
			layer: 'service',
			tags: ['api', 'auth'],
		});
		expect(result.content).toBe('# Content here\n\nSome markdown content.');
	});

	it('handles missing frontmatter', () => {
		const raw = '# Just content\n\nNo frontmatter here.';
		const result = parseBlueprintMarkdown(raw);
		expect(result.meta).toEqual({});
		expect(result.content).toBe('# Just content\n\nNo frontmatter here.');
	});

	it('handles partial frontmatter', () => {
		const raw = `---
name: Partial
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.name).toBe('Partial');
		expect(result.meta.description).toBeUndefined();
		expect(result.content).toBe('Content');
	});

	it('handles project as a plain string field', () => {
		const raw = `---
project: webapp
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.project).toBe('webapp');
	});

	it('parses technologies as comma-separated list', () => {
		const raw = `---
technologies: react, drizzle
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.technologies).toEqual(['react', 'drizzle']);
	});

	it('handles quoted values', () => {
		const raw = `---
name: "Quoted Name"
description: 'Single quoted'
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.name).toBe('Quoted Name');
		expect(result.meta.description).toBe('Single quoted');
	});

	it('handles quoted tags', () => {
		const raw = `---
tags: ["react", "hooks"]
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.tags).toEqual(['react', 'hooks']);
	});

	it('handles empty string', () => {
		const result = parseBlueprintMarkdown('');
		expect(result.meta).toEqual({});
		expect(result.content).toBe('');
	});

	it('handles lines without colons in frontmatter', () => {
		const raw = `---
name: Valid
this-has-no-colon-value
layer: service
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.name).toBe('Valid');
		expect(result.meta.layer).toBe('service');
		expect(result.content).toBe('Content');
	});

	it('handles unknown frontmatter keys', () => {
		const raw = `---
name: Test
unknownKey: some value
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.name).toBe('Test');
		expect(result.content).toBe('Content');
	});

	it('handles empty tags', () => {
		const raw = `---
tags: []
---

Content`;

		const result = parseBlueprintMarkdown(raw);
		expect(result.meta.tags).toEqual([]);
	});
});
