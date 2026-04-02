import { build } from 'esbuild';

await build({
	entryPoints: ['index.ts'],
	bundle: true,
	platform: 'node',
	target: 'node22',
	format: 'esm',
	outfile: 'dist/index.mjs',
	external: ['onnxruntime-node'],
	minify: true,
	banner: { js: 'import{createRequire}from"module";const require=createRequire(import.meta.url);' },
});

console.log('API bundled to dist/index.mjs');
