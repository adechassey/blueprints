import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const funcDir = '.vercel/output/functions/index.func';

mkdirSync(funcDir, { recursive: true });
copyFileSync('dist/index.mjs', `${funcDir}/index.mjs`);

writeFileSync(
	`${funcDir}/.vc-config.json`,
	JSON.stringify(
		{
			runtime: 'nodejs22.x',
			handler: 'index.mjs',
			launcherType: 'Nodejs',
			supportsResponseStreaming: true,
		},
		null,
		'\t',
	),
);

writeFileSync(
	'.vercel/output/config.json',
	JSON.stringify(
		{
			version: 3,
			routes: [{ src: '/.*', dest: '/' }],
		},
		null,
		'\t',
	),
);

console.log('Vercel Build Output API structure created');
