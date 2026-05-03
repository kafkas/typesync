/**
 * Orchestrator for the per-platform integration suites under
 * `tests/integration/<platform>/`.
 *
 * Responsibilities:
 *   1. Generate code from each shared schema fixture into the platform's
 *      `generated/` directory using the typesync programmatic API.
 *   2. Wrap the platform's native test runner in `firebase emulators:exec`
 *      so the Firestore emulator is available at `localhost:8080` for the
 *      duration of the run.
 *
 * Used by the `yarn test:integration*` scripts in package.json.
 *
 * Usage:
 *   yarn tsx scripts/integration-test.ts python
 *   yarn tsx scripts/integration-test.ts swift
 *   yarn tsx scripts/integration-test.ts typescript
 *   yarn tsx scripts/integration-test.ts all
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { argv, exit } from 'node:process';

import { typesync } from '../src/api/index.js';

type Platform = 'python' | 'swift' | 'typescript';

const REPO_ROOT = resolve(import.meta.dirname, '..');
const FIXTURES_ROOT = resolve(REPO_ROOT, 'tests/integration/_fixtures');
const FIXTURES_SCHEMAS = resolve(FIXTURES_ROOT, 'schemas');
const FIREBASE_PROJECT_ID = 'demo-integration';

// Suites that don't run from the repo root (notably Swift, which runs from
// its package dir) read this env var to locate shared sample fixtures.
process.env.TYPESYNC_INTEGRATION_FIXTURES_ROOT ??= FIXTURES_ROOT;

interface PlatformConfig {
  generatedDir: string;
  generatedExtension: string;
  generate: (definitionPath: string, outFile: string) => Promise<void>;
  runs: { description: string; cwd: string; cmd: string; args: string[]; underEmulator: boolean }[];
}

const PLATFORMS: Record<Platform, PlatformConfig> = {
  python: {
    generatedDir: resolve(REPO_ROOT, 'tests/integration/python/generated'),
    generatedExtension: '.py',
    async generate(definition, outFile) {
      await typesync.generatePy({
        definition,
        outFile,
        target: 'firebase-admin@6',
      });
    },
    runs: [
      {
        description: 'pytest (round-trip via emulator)',
        cwd: resolve(REPO_ROOT, 'tests/integration/python'),
        cmd: 'poetry',
        args: ['run', 'pytest'],
        underEmulator: true,
      },
    ],
  },
  swift: {
    generatedDir: resolve(REPO_ROOT, 'tests/integration/swift/Sources/TypesyncIntegration/Generated'),
    generatedExtension: '.swift',
    async generate(definition, outFile) {
      await typesync.generateSwift({
        definition,
        outFile,
        target: 'firebase@10',
      });
    },
    runs: [
      {
        description: 'swift test (round-trip via emulator)',
        cwd: resolve(REPO_ROOT, 'tests/integration/swift'),
        cmd: 'swift',
        args: ['test'],
        underEmulator: true,
      },
    ],
  },
  typescript: {
    generatedDir: resolve(REPO_ROOT, 'tests/integration/typescript/generated'),
    generatedExtension: '.ts',
    async generate(definition, outFile) {
      await typesync.generateTs({
        definition,
        outFile,
        target: 'firebase-admin@13',
        objectTypeFormat: 'interface',
      });
    },
    runs: [
      {
        description: 'tsc --noEmit (compile-time check)',
        cwd: resolve(REPO_ROOT, 'tests/integration/typescript'),
        cmd: 'yarn',
        args: ['tsc', '--noEmit', '-p', '.'],
        underEmulator: false,
      },
      {
        description: 'vitest (round-trip via emulator)',
        cwd: REPO_ROOT,
        cmd: 'yarn',
        args: ['vitest', 'run', '-c', 'tests/integration/typescript/vitest.config.ts'],
        underEmulator: true,
      },
    ],
  },
};

function listSchemaFixtures(): { path: string; name: string }[] {
  if (!existsSync(FIXTURES_SCHEMAS)) {
    throw new Error(`Schema fixtures directory does not exist: ${FIXTURES_SCHEMAS}`);
  }
  const entries = readdirSync(FIXTURES_SCHEMAS).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  if (entries.length === 0) {
    throw new Error(`No schema fixtures found under ${FIXTURES_SCHEMAS}`);
  }
  return entries.map(file => ({
    path: resolve(FIXTURES_SCHEMAS, file),
    name: basename(file, extname(file)),
  }));
}

function clearGeneratedDir(generatedDir: string, extension: string): void {
  if (!existsSync(generatedDir)) return;
  for (const entry of readdirSync(generatedDir)) {
    if (entry.endsWith(extension)) {
      rmSync(resolve(generatedDir, entry));
    }
  }
}

async function generateAll(platform: Platform, config: PlatformConfig): Promise<void> {
  console.log(`\n[${platform}] generating fixtures…`);
  clearGeneratedDir(config.generatedDir, config.generatedExtension);
  for (const fixture of listSchemaFixtures()) {
    const outFile = resolve(config.generatedDir, `${fixture.name}${config.generatedExtension}`);
    await config.generate(fixture.path, outFile);
    console.log(`  → ${fixture.name} -> ${outFile}`);
  }
}

const FIREBASE_BIN = resolve(REPO_ROOT, 'node_modules/.bin/firebase');

function runStep(platform: Platform, step: PlatformConfig['runs'][number]): void {
  console.log(`\n[${platform}] ${step.description}`);
  let cmd = step.cmd;
  let args = step.args;
  if (step.underEmulator) {
    // Wrap the platform command in `firebase emulators:exec`. We call the
    // local firebase binstub directly so that yarn doesn't reset the cwd
    // by walking up to the nearest package.json.
    const inner = [step.cmd, ...step.args].map(quoteForShell).join(' ');
    cmd = FIREBASE_BIN;
    args = ['emulators:exec', '--project', FIREBASE_PROJECT_ID, '--only', 'firestore', inner];
  }
  const result = spawnSync(cmd, args, {
    cwd: step.cwd,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`[${platform}] step "${step.description}" failed with exit code ${result.status ?? 'null'}`);
  }
}

function quoteForShell(s: string): string {
  if (/^[A-Za-z0-9._/=:@%+,-]+$/.test(s)) return s;
  return `'${s.replaceAll("'", `'\\''`)}'`;
}

async function runPlatform(platform: Platform): Promise<void> {
  const config = PLATFORMS[platform];
  await generateAll(platform, config);
  for (const step of config.runs) {
    runStep(platform, step);
  }
}

async function main(): Promise<void> {
  const arg = (argv[2] ?? '').toLowerCase();
  const targets: Platform[] = arg === 'all' || arg === '' ? ['python', 'swift', 'typescript'] : [arg as Platform];

  for (const platform of targets) {
    if (!(platform in PLATFORMS)) {
      throw new Error(`Unknown platform "${platform}". Expected one of: python, swift, typescript, all.`);
    }
  }

  for (const platform of targets) {
    await runPlatform(platform);
  }

  console.log('\nAll integration suites passed.');
}

main().catch(err => {
  console.error(err.message ?? err);
  exit(1);
});
