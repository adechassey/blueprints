import { build } from 'esbuild';

await build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	platform: 'node',
	target: 'node22',
	format: 'cjs',
	outfile: 'dist/theodo-blueprints.cjs',
	minify: true,
	define: {
		// Set by the release workflow from the cli-vX.Y.Z tag; local bundles report "dev".
		'process.env.CLI_VERSION': JSON.stringify(process.env.CLI_VERSION ?? 'dev'),
	},
});

console.log(`Bundled to dist/theodo-blueprints.cjs (version ${process.env.CLI_VERSION ?? 'dev'})`);
