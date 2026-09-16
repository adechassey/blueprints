import { spawnSync } from 'node:child_process';
import chalk from 'chalk';
import type { Command } from 'commander';
import { getInstallCommand, isNewerVersion, parseVersion } from '../lib/update.core.js';
import { fetchLatestVersion } from '../lib/update.js';
import { CLI_VERSION } from '../lib/version.js';

export function registerUpdateCommand(program: Command) {
	program
		.command('update')
		.description('Update the CLI to the latest release')
		.option('--check', 'Only report whether an update is available')
		.action(async (opts: { check?: boolean }) => {
			console.log(chalk.dim(`Current version: ${CLI_VERSION}`));
			const latest = await fetchLatestVersion();
			if (!latest) {
				console.error(chalk.red('Could not reach GitHub to look up the latest release.'));
				process.exit(1);
			}

			const command = getInstallCommand(process.platform);
			if (parseVersion(CLI_VERSION) === null) {
				console.log(chalk.yellow(`This is a dev build. Latest release: ${latest}`));
				console.log(`Install it with: ${chalk.cyan(command)}`);
				return;
			}
			if (!isNewerVersion(CLI_VERSION, latest)) {
				console.log(chalk.green(`Already up to date (${latest}).`));
				return;
			}

			console.log(chalk.blue(`Update available: ${CLI_VERSION} → ${latest}`));
			if (opts.check) {
				console.log(`Run: ${chalk.cyan(command)}`);
				return;
			}

			console.log(chalk.dim(`Running: ${command}`));
			const result =
				process.platform === 'win32'
					? spawnSync(
							'powershell',
							['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
							{
								stdio: 'inherit',
							},
						)
					: spawnSync('sh', ['-c', command], { stdio: 'inherit' });
			process.exit(result.status ?? 1);
		});
}
