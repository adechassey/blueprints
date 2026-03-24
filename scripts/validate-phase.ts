#!/usr/bin/env tsx
/**
 * Phase Validation Script
 *
 * Only the validation agent should run this script.
 * The main ralph loop agent is forbidden from calling it directly.
 *
 * Usage: pnpm tsx scripts/validate-phase.ts <phase-number>
 *
 * What it does:
 * 1. Verifies the spec file exists for the given phase
 * 2. Runs pnpm check (lint + format)
 * 3. Runs pnpm check-types (TypeScript)
 * 4. Runs pnpm test (Vitest)
 * 5. If ALL pass, generates a validation hash and writes to tracker.json
 */

import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SALT = "theodo-blueprints-validation-v1-2026";
const STATUS_PATH = join(
  __dirname,
  "..",
  "docs",
  "features",
  "blueprint-server",
  "tracker.json",
);
const PHASES_DIR = join(
  __dirname,
  "..",
  "docs",
  "features",
  "blueprint-server",
);

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

function fail(message: string): never {
  console.error(`\n❌ VALIDATION FAILED: ${message}`);
  process.exit(1);
}

function log(message: string): void {
  console.log(`  ✓ ${message}`);
}

function runCheck(label: string, command: string): string {
  console.log(`\n🔍 Running: ${label}...`);
  try {
    const output = execSync(command, {
      cwd: join(__dirname, ".."),
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120_000,
    });
    log(`${label} passed`);
    return output;
  } catch (error) {
    const err = error as { stderr?: string; stdout?: string };
    const details = err.stderr || err.stdout || "No output";
    fail(`${label} failed:\n${details}`);
  }
}

function main(): void {
  const phaseArg = process.argv[2];

  if (!phaseArg || !/^[1-6]$/.test(phaseArg)) {
    fail("Usage: pnpm tsx scripts/validate-phase.ts <phase-number (1-6)>");
  }

  const phaseNum = phaseArg;

  console.log(`\n🏗️  Validating Phase ${phaseNum}...\n`);

  // 1. Read status file
  if (!existsSync(STATUS_PATH)) {
    fail("tracker.json not found");
  }

  const status: PhaseStatus = JSON.parse(readFileSync(STATUS_PATH, "utf-8"));
  const phase = status.phases[phaseNum];

  if (!phase) {
    fail(`Phase ${phaseNum} not found in tracker.json`);
  }

  if (phase.status === "validated") {
    console.log(`\n✅ Phase ${phaseNum} (${phase.name}) is already validated.`);
    process.exit(0);
  }

  // 2. Check previous phases are validated
  for (let i = 1; i < Number(phaseNum); i++) {
    const prev = status.phases[String(i)];
    if (prev && prev.status !== "validated") {
      fail(
        `Phase ${i} (${prev.name}) must be validated before phase ${phaseNum}`,
      );
    }
  }

  // 3. Check spec exists
  const specPath = join(PHASES_DIR, phase.folder, "spec.md");
  if (!existsSync(specPath)) {
    fail(`Spec file not found: ${specPath}`);
  }

  const specContent = readFileSync(specPath, "utf-8");
  if (specContent.trim().length < 100) {
    fail("Spec file is too short — likely incomplete");
  }

  log(`Spec file found (${specContent.length} chars)`);

  // 4. Check PRD exists
  const prdPath = join(PHASES_DIR, phase.folder, "prd.md");
  if (!existsSync(prdPath)) {
    fail(`PRD file not found: ${prdPath}`);
  }

  log("PRD file found");

  // 5. Run automated checks
  const checkOutput = runCheck("Biome lint + format", "pnpm check");
  const typesOutput = runCheck("TypeScript type check", "pnpm check-types");
  const testOutput = runCheck("Unit tests", "pnpm test");

  // 6. All passed — generate validation hash
  const timestamp = new Date().toISOString();
  const hashInput = [
    `phase:${phaseNum}`,
    `name:${phase.name}`,
    `spec:${createHash("sha256").update(specContent).digest("hex")}`,
    `check:${createHash("sha256").update(checkOutput).digest("hex")}`,
    `types:${createHash("sha256").update(typesOutput).digest("hex")}`,
    `test:${createHash("sha256").update(testOutput).digest("hex")}`,
    `timestamp:${timestamp}`,
    `salt:${SALT}`,
  ].join("|");

  const validationHash = createHash("sha256").update(hashInput).digest("hex");

  // 7. Write to status file
  status.phases[phaseNum] = {
    ...phase,
    status: "validated",
    validationHash,
    completedAt: timestamp,
  };

  writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2) + "\n", "utf-8");

  console.log(`\n✅ Phase ${phaseNum} (${phase.name}) VALIDATED`);
  console.log(`   Hash: ${validationHash.slice(0, 16)}...`);
  console.log(`   Time: ${timestamp}`);
  console.log(`\n📝 tracker.json updated.`);
}

main();
