#!/usr/bin/env node
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
import { CLI_VERSION } from './lib/version.js';

const program = new Command();

program
	.name('theodo-blueprints')
	.description('CLI for the Theodo Blueprints registry')
	.version(CLI_VERSION);

registerAuthCommands(program);
registerPushCommand(program);
registerSyncCommand(program);
registerPullCommand(program);
registerSearchCommand(program);
registerListCommand(program);
registerInfoCommand(program);
registerIndexCommand(program);
registerProjectsCommand(program);

program.parse();
