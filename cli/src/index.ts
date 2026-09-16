#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerIndexCommand } from './commands/index.js';
import { registerInfoCommand } from './commands/info.js';
import { registerListCommand } from './commands/list.js';
import { registerProjectsCommand } from './commands/projects.js';
import { registerPullCommand } from './commands/pull.js';
import { registerPushCommand } from './commands/push.js';
import { registerSearchCommand } from './commands/search.js';
import { registerSyncCommand } from './commands/sync.js';
import { registerUpdateCommand } from './commands/update.js';
import { printUpdateNotice, startUpdateCheck } from './lib/update.js';
import { CLI_VERSION } from './lib/version.js';

const program = new Command();

program
	.name('theodo-blueprints')
	.description('CLI for the Theodo Blueprints registry')
	.version(CLI_VERSION);

// Passive update notice: the GitHub lookup overlaps with the command and prints after it.
let pendingUpdateNotice: Promise<string | null> = Promise.resolve(null);
program.hook('preAction', (_thisCommand, actionCommand) => {
	if (actionCommand.name() !== 'update') pendingUpdateNotice = startUpdateCheck();
});
program.hook('postAction', async () => {
	const notice = await pendingUpdateNotice;
	if (notice) printUpdateNotice(notice);
});

registerAuthCommands(program);
registerPushCommand(program);
registerSyncCommand(program);
registerPullCommand(program);
registerSearchCommand(program);
registerListCommand(program);
registerInfoCommand(program);
registerIndexCommand(program);
registerProjectsCommand(program);
registerUpdateCommand(program);

program.parseAsync().catch((err: unknown) => {
	console.error(chalk.red(err instanceof Error ? err.message : String(err)));
	process.exit(1);
});
