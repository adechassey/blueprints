import { describe, expect, it } from 'vitest';
import { splitInlineCode } from './inline-code.core.js';

describe('splitInlineCode', () => {
	it('returns plain text as a single segment', () => {
		expect(splitInlineCode('Use for POST endpoints')).toEqual([
			{ kind: 'text', value: 'Use for POST endpoints', offset: 0 },
		]);
	});

	it('splits code spans out of the text', () => {
		expect(splitInlineCode('never `unknown` — from `schema`.')).toEqual([
			{ kind: 'text', value: 'never ', offset: 0 },
			{ kind: 'code', value: 'unknown', offset: 7 },
			{ kind: 'text', value: ' — from ', offset: 15 },
			{ kind: 'code', value: 'schema', offset: 24 },
			{ kind: 'text', value: '.', offset: 31 },
		]);
	});

	it('starts with a code span without an empty text segment', () => {
		expect(splitInlineCode('`a` b')).toEqual([
			{ kind: 'code', value: 'a', offset: 1 },
			{ kind: 'text', value: ' b', offset: 3 },
		]);
	});

	it('keeps an unclosed backtick as text', () => {
		expect(splitInlineCode('a `b c')).toEqual([{ kind: 'text', value: 'a `b c', offset: 0 }]);
	});

	it('drops an empty code span', () => {
		expect(splitInlineCode('a `` b')).toEqual([
			{ kind: 'text', value: 'a ', offset: 0 },
			{ kind: 'text', value: ' b', offset: 4 },
		]);
	});

	it('leaves markdown emphasis markers alone', () => {
		expect(splitInlineCode('server/*/services/*')).toEqual([
			{ kind: 'text', value: 'server/*/services/*', offset: 0 },
		]);
	});

	it('returns nothing for an empty string', () => {
		expect(splitInlineCode('')).toEqual([]);
	});
});
