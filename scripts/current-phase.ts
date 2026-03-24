#!/usr/bin/env tsx
/**
 * Current Phase Script
 *
 * Reads tracker.json and outputs the next phase to work on.
 * Used by the ralph loop agent to determine what to do next.
 *
 * Usage: pnpm tsx scripts/current-phase.ts
 *
 * Output (JSON):
 *   { "done": false, "phase": "2", "name": "core", "folder": "phase-2-core", "hasSpec": true }
 *   { "done": true }
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const STATUS_PATH = join(__dirname, '..', 'docs', 'features', 'blueprint-server', 'tracker.json');
const PHASES_DIR = join(__dirname, '..', 'docs', 'features', 'blueprint-server');

interface PhaseEntry {
	name: string;
	folder: string;
	status: string;
	validationHash: string | null;
	completedAt: string | null;
}

interface PhaseStatus {
	phases: Record<string, PhaseEntry>;
}

function main(): void {
	if (!existsSync(STATUS_PATH)) {
		console.log(JSON.stringify({ error: 'tracker.json not found' }));
		process.exit(1);
	}

	const status: PhaseStatus = JSON.parse(readFileSync(STATUS_PATH, 'utf-8'));

	// Find first pending phase
	for (const [num, phase] of Object.entries(status.phases)) {
		if (phase.status === 'pending') {
			const specPath = join(PHASES_DIR, phase.folder, 'spec.md');
			const hasSpec = existsSync(specPath);
			const _prdPath = join(PHASES_DIR, phase.folder, 'prd.md');

			console.log(
				JSON.stringify({
					done: false,
					phase: num,
					name: phase.name,
					folder: phase.folder,
					hasSpec,
					prdPath: `docs/features/blueprint-server/${phase.folder}/prd.md`,
					specPath: `docs/features/blueprint-server/${phase.folder}/spec.md`,
				}),
			);
			return;
		}
	}

	// All phases validated
	console.log(JSON.stringify({ done: true }));
}

main();
