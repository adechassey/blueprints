import { describe, expect, it } from 'vitest';
import { stripSyncedPreamble } from './synced-preamble.core.js';

const fields = { description: 'Creates a resource', usage: 'Use for POST endpoints' };
const preamble =
	'## Context\n\nCreates a resource\n\n## Usage\n\nUse for POST endpoints\n\n## Implementation\n\n';
const excerpt = '```typescript\nexport const x = 1;\n```\n';

describe('stripSyncedPreamble', () => {
	it('drops the sections that repeat the fields, exemplar line included', () => {
		const content = `${preamble}Exemplar: \`src/a.ts:42\`\n\n${excerpt}`;
		expect(stripSyncedPreamble(content, fields)).toBe(excerpt);
	});

	it('drops the sections without an exemplar line', () => {
		expect(stripSyncedPreamble(`${preamble}${excerpt}`, fields)).toBe(excerpt);
	});

	it('keeps a context that differs from the description', () => {
		const content = `${preamble}${excerpt}`;
		expect(stripSyncedPreamble(content, { ...fields, description: 'Edited' })).toBe(content);
	});

	it('keeps a usage that differs from the field', () => {
		const content = `${preamble}${excerpt}`;
		expect(stripSyncedPreamble(content, { ...fields, usage: undefined })).toBe(content);
	});

	it('keeps content without a synced preamble', () => {
		const content = '# Steps\n\nDo the thing.';
		expect(stripSyncedPreamble(content, fields)).toBe(content);
	});

	it('drops the generic context written when the description was empty', () => {
		const content = `## Context\n\nPattern \`my-pattern\` — canonical exemplar in the source codebase.\n\n## Usage\n\nUse for POST endpoints\n\n## Implementation\n\n${excerpt}`;
		expect(stripSyncedPreamble(content, { description: null, usage: fields.usage })).toBe(excerpt);
	});

	it('keeps a hand-written context when the description is empty', () => {
		const content = `## Context\n\nSomething custom\n\n## Usage\n\nUse for POST endpoints\n\n## Implementation\n\n${excerpt}`;
		expect(stripSyncedPreamble(content, { description: '', usage: fields.usage })).toBe(content);
	});

	it('yields nothing when the content was the preamble only', () => {
		expect(stripSyncedPreamble(`${preamble}Exemplar: \`src/a.ts\`\n`, fields)).toBe('');
	});
});
