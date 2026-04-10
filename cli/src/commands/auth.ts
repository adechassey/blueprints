import chalk from 'chalk';
import type { Command } from 'commander';
import { createApiClient, unwrapResponse } from '../lib/api.js';
import { clearToken, getConfig, saveToken } from '../lib/config.js';

export function registerAuthCommands(program: Command) {
	const auth = program.command('auth').description('Authentication commands');

	auth
		.command('login')
		.description('Log in to the blueprint registry')
		.option('--token <token>', 'Provide token directly')
		.action(async (opts: { token?: string }) => {
			if (opts.token) {
				saveToken(opts.token);
				console.log(chalk.green('Token saved successfully.'));
				return;
			}

			const config = getConfig();
			const webappUrl = config.server.replace('-api', '-webapp').replace(':3001', ':5173');
			const tokenUrl = `${webappUrl}/cli-token`;

			console.log(chalk.blue('Opening browser to authenticate...'));
			console.log(`  ${tokenUrl}`);
			console.log();

			const { exec } = await import('node:child_process');
			const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
			exec(`${cmd} ${tokenUrl}`);

			console.log('After signing in, copy the command from the page and paste it here.');
		});

	auth
		.command('status')
		.description('Show current authentication status')
		.action(async () => {
			const config = getConfig();
			if (!config.token) {
				console.log(chalk.yellow('Not logged in.'));
				return;
			}
			try {
				const client = createApiClient();
				const res = await client.api.users.me.$get();
				const user = await unwrapResponse(res);
				console.log(chalk.green(`Logged in as ${user.name} (${user.email})`));
				console.log(`  Role: ${user.role}`);
				console.log(`  Server: ${config.server}`);
			} catch {
				console.log(chalk.red('Token is invalid or expired. Please log in again.'));
			}
		});

	auth
		.command('logout')
		.description('Clear stored credentials')
		.action(() => {
			clearToken();
			console.log(chalk.green('Logged out successfully.'));
		});
}
