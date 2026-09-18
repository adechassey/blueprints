import { describe, expect, it } from 'vitest';
import { splitAnnotationHeader } from './annotation.core.js';

describe('splitAnnotationHeader', () => {
	it('peels a leading @Blueprint comment block off the declaration', () => {
		const excerpt = [
			'// @Blueprint server-action',
			'// @BlueprintName Server Action Entrypoint',
			'export async function act() {',
			'  return 1;',
			'}',
		].join('\n');
		expect(splitAnnotationHeader(excerpt)).toEqual({
			annotation: '// @Blueprint server-action\n// @BlueprintName Server Action Entrypoint',
			code: 'export async function act() {\n  return 1;\n}',
		});
	});

	it('understands hash comments', () => {
		expect(splitAnnotationHeader('# @Blueprint repo-find\ndef find():\n    pass')).toEqual({
			annotation: '# @Blueprint repo-find',
			code: 'def find():\n    pass',
		});
	});

	it('keeps a comment block that is not an annotation', () => {
		const excerpt = '// Helper\nexport const x = 1;';
		expect(splitAnnotationHeader(excerpt)).toEqual({ annotation: '', code: excerpt });
	});

	it('keeps an excerpt made of comments only', () => {
		const excerpt = '// @Blueprint only\n// nothing else';
		expect(splitAnnotationHeader(excerpt)).toEqual({ annotation: '', code: excerpt });
	});

	it('keeps an excerpt that starts with code', () => {
		const excerpt = 'export const x = 1;\n// @Blueprint later';
		expect(splitAnnotationHeader(excerpt)).toEqual({ annotation: '', code: excerpt });
	});

	it('handles an empty excerpt', () => {
		expect(splitAnnotationHeader('')).toEqual({ annotation: '', code: '' });
	});
});
