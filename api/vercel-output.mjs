import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const funcDir = '.vercel/output/functions/api/[[...path]].func';

mkdirSync(funcDir, { recursive: true });
copyFileSync('dist/index.mjs', `${funcDir}/index.mjs`);

writeFileSync(
	`${funcDir}/.vc-config.json`,
	JSON.stringify(
		{
			runtime: 'nodejs22.x',
			handler: 'index.mjs',
			launcherType: 'Nodejs',
		},
		null,
		'\t',
	),
);

writeFileSync(
	'.vercel/output/config.json',
	JSON.stringify({ version: 3 }, null, '\t'),
);

console.log('Vercel Build Output API structure created');
