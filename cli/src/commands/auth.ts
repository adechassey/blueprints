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
			const { exec } = await import('node:child_process');
			const openBrowser = (url: string) => {
				const cmd =
					process.platform === 'darwin'
						? 'open'
						: process.platform === 'win32'
							? 'start'
							: 'xdg-open';
				exec(`${cmd} ${url}`);
			};

			// OAuth device flow (RFC 8628): request a device code, have the user
			// approve it in the browser, then poll for the session token.
			console.log(chalk.blue('Requesting device code...'));
			const codeRes = await fetch(`${config.server}/api/auth/device/code`, { method: 'POST' });
			if (!codeRes.ok) {
				throw new Error(`Failed to start device authorization: HTTP ${codeRes.status}`);
			}
			const code = (await codeRes.json()) as {
				device_code: string;
				user_code: string;
				verification_uri: string;
				expires_in: number;
				interval: number;
			};

			console.log();
			console.log(`  ${chalk.bold('Code:')} ${chalk.cyan(chalk.bold(code.user_code))}`);
			console.log(`  ${chalk.bold('URL:')} ${code.verification_uri}`);
			console.log();
			openBrowser(code.verification_uri);
			console.log('Opening browser — if it did not open, visit the URL above and enter the code.');
			console.log(chalk.dim('Waiting for authorization... (Ctrl+C to cancel)'));

			const deadline = Date.now() + code.expires_in * 1000;
			let intervalMs = code.interval * 1000;

			while (Date.now() < deadline) {
				await new Promise((resolve) => setTimeout(resolve, intervalMs));
				const pollRes = await fetch(`${config.server}/api/auth/device/token`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ device_code: code.device_code }),
				});

				if (pollRes.ok) {
					const body = (await pollRes.json()) as { access_token: string };
					saveToken(body.access_token);
					console.log(chalk.green('\nAuthorized successfully. Credentials saved.'));
					return;
				}

				const body = (await pollRes.json().catch(() => ({}))) as { error?: string };
				if (body.error === 'slow_down') {
					intervalMs += 2000; // per RFC 8628, back off on slow_down
				} else if (body.error && body.error !== 'authorization_pending') {
					throw new Error(`Authorization failed: ${body.error}`);
				}
			}

			throw new Error('Device authorization timed out. Please try again.');
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
