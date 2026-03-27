import { build } from 'esbuild';

await build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	platform: 'node',
	target: 'node22',
	format: 'cjs',
	outfile: 'dist/theodo-blueprints.cjs',
	minify: true,
});

console.log('Bundled to dist/theodo-blueprints.cjs');
