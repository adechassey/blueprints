import { build } from 'esbuild';

await build({
	entryPoints: ['index.ts'],
	bundle: true,
	platform: 'node',
	target: 'node22',
	format: 'esm',
	outfile: 'api/[[...path]].mjs',
	external: ['@huggingface/transformers'],
	minify: true,
	banner: { js: 'import{createRequire}from"module";const require=createRequire(import.meta.url);' },
});

console.log('API bundled to api/[[...path]].mjs');
