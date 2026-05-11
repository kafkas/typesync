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
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { argv, exit } from 'node:process';

import { typesync } from '../src/api/index.js';

type Platform = 'python' | 'swift' | 'typescript' | 'zod';

const REPO_ROOT = resolve(import.meta.dirname, '..');
const FIXTURES_ROOT = resolve(REPO_ROOT, 'tests/integration/_fixtures');
const FIXTURES_SCHEMAS = resolve(FIXTURES_ROOT, 'schemas');
const ZOD_FIXTURES_SCHEMAS = resolve(REPO_ROOT, 'tests/integration/zod/_fixtures/schemas');
const FIREBASE_PROJECT_ID = 'demo-integration';

// Suites that don't run from the repo root (notably Swift, which runs from
// its package dir) read this env var to locate shared sample fixtures.
process.env.TYPESYNC_INTEGRATION_FIXTURES_ROOT ??= FIXTURES_ROOT;

interface PlatformConfig {
  /**
   * Optional list of additional schema-fixture dirs that this platform
   * should pull schemas from in addition to the shared
   * `tests/integration/_fixtures/schemas/`. Used by the Zod suite to pick
   * up zod-only fixtures (e.g. discriminated unions, simple unions, etc.)
   * that are not safe to add to the shared dir without forcing every other
   * platform to add round-trip coverage for them.
   */
  extraFixturesSchemasDirs?: string[];
  generatedDir: string;
  generatedExtension: string;
  /**
   * Primary generation pass. Writes to `generatedDir/<fixture>.<ext>`. May
   * be omitted by platforms whose generations are *all* in subdirs (e.g.
   * `zod`, which emits `generated/{v3,v4,v4-web}/<fixture>.ts`).
   */
  generate?: (definitionPath: string, outFile: string) => Promise<void>;
  /**
   * See `ExtraGeneration`. The TypeScript suite uses this to also emit code
   * against the web SDK so the `bytes` primitive can be round-tripped with
   * each target's native representation; the Zod suite uses it to emit each
   * fixture against both Zod v3 and v4 (and the v4 web SDK).
   */
  extraGenerations?: ExtraGeneration[];
  /**
   * Optional post-write hook applied to every file written by the *primary*
   * `generate` pass. Run after the file is written to disk and before any
   * test runs.
   */
  postProcessFile?: (filePath: string) => void;
  runs: { description: string; cwd: string; cmd: string; args: string[]; underEmulator: boolean }[];
}

interface ExtraGeneration {
  /**
   * Subdirectory under `generatedDir` that the extra pass writes to. The
   * platform's `tsconfig.json` / `Package.swift` etc. must already include
   * files in this directory.
   */
  subdir: string;
  /**
   * Restricts the pass to a subset of fixtures (matched by basename, e.g.
   * `'secrets'`). Omit to apply to every fixture.
   */
  onlyFixtures?: string[];
  generate: (definitionPath: string, outFile: string) => Promise<void>;
  /**
   * Optional post-write hook. Receives the path of every generated file and
   * may rewrite its contents in place. Used by the Zod platform to rewrite
   * `from 'zod'` imports to a versioned alias so v3 and v4 can coexist in a
   * single Node project.
   */
  postProcessFile?: (filePath: string) => void;
}

/**
 * Rewrites bare `from 'zod'` and `require('zod')` references to a versioned
 * alias (e.g. `zod-v3`). Used by the Zod integration suite so we can keep
 * `zod@3` and `zod@4` installed simultaneously and load each generator's
 * output against the correct Zod major.
 */
function rewriteZodImport(filePath: string, alias: string): void {
  const original = readFileSync(filePath, 'utf8');
  const rewritten = original.replaceAll(`from 'zod'`, `from '${alias}'`).replaceAll(`from "zod"`, `from "${alias}"`);
  if (rewritten !== original) writeFileSync(filePath, rewritten);
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
    // The `bytes` scenario is the only place where the wire-level
    // representation differs across TS targets (Buffer vs firestore.Bytes
    // vs firestore.Blob), so we emit it against the web SDK in addition
    // to the admin SDK. The admin pass above writes `generated/secrets.ts`;
    // this pass writes `generated/web/secrets.ts`, which is imported by
    // the dedicated `secrets.web.test.ts` round-trip suite. The
    // react-native-firebase target is verified by the unit/snapshot tests
    // under `src/renderers/ts/__tests__/`; we don't run it here because
    // `@react-native-firebase/firestore` is RN-runtime-only and cannot
    // execute under Node.
    extraGenerations: [
      {
        subdir: 'web',
        onlyFixtures: ['secrets'],
        async generate(definition, outFile) {
          await typesync.generateTs({
            definition,
            outFile,
            target: 'firebase@10',
            objectTypeFormat: 'interface',
          });
        },
      },
    ],
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
  // Zod integration suite. Each shared + zod-only fixture is emitted three
  // times: Zod v3 against firebase-admin (primary `generate`), Zod v4 against
  // firebase-admin (extra `v4`), and Zod v4 against the web SDK (extra
  // `v4-web`, only for the `bytes` fixture). The primary pass writes to
  // `generated/v3/<fixture>.ts`; the post-process step rewrites every
  // `from 'zod'` to `from 'zod-v3'` so a single Node package can keep both
  // Zod majors installed side-by-side via npm aliases.
  zod: {
    extraFixturesSchemasDirs: [ZOD_FIXTURES_SCHEMAS],
    generatedDir: resolve(REPO_ROOT, 'tests/integration/zod/generated'),
    generatedExtension: '.ts',
    extraGenerations: [
      {
        subdir: 'v3',
        async generate(definition, outFile) {
          await typesync.generateZod({
            definition,
            outFile,
            target: 'firebase-admin@13',
            variant: 'v3',
            emitInferredTypes: true,
          });
        },
        postProcessFile(filePath) {
          rewriteZodImport(filePath, 'zod-v3');
        },
      },
      {
        subdir: 'v4',
        async generate(definition, outFile) {
          await typesync.generateZod({
            definition,
            outFile,
            target: 'firebase-admin@13',
            variant: 'v4',
            emitInferredTypes: true,
          });
        },
        postProcessFile(filePath) {
          rewriteZodImport(filePath, 'zod-v4');
        },
      },
      {
        subdir: 'v4-web',
        onlyFixtures: ['secrets'],
        async generate(definition, outFile) {
          await typesync.generateZod({
            definition,
            outFile,
            target: 'firebase@10',
            variant: 'v4',
            emitInferredTypes: true,
          });
        },
        postProcessFile(filePath) {
          rewriteZodImport(filePath, 'zod-v4');
        },
      },
    ],
    runs: [
      {
        description: 'tsc --noEmit (compile-time check)',
        cwd: resolve(REPO_ROOT, 'tests/integration/zod'),
        cmd: 'yarn',
        args: ['tsc', '--noEmit', '-p', '.'],
        underEmulator: false,
      },
      {
        description: 'vitest (Zod round-trip + Firestore emulator)',
        cwd: REPO_ROOT,
        cmd: 'yarn',
        args: ['vitest', 'run', '-c', 'tests/integration/zod/vitest.config.ts'],
        underEmulator: true,
      },
    ],
  },
};

function listSchemaFixtures(extraDirs: string[] = []): { path: string; name: string }[] {
  const dirs = [FIXTURES_SCHEMAS, ...extraDirs];
  const fixtures: { path: string; name: string }[] = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      throw new Error(`Schema fixtures directory does not exist: ${dir}`);
    }
    const entries = readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    for (const file of entries) {
      fixtures.push({
        path: resolve(dir, file),
        name: basename(file, extname(file)),
      });
    }
  }
  if (fixtures.length === 0) {
    throw new Error(`No schema fixtures found under ${dirs.join(', ')}`);
  }
  // Defensive: a name collision between dirs would silently overwrite
  // generated files. Easier to surface it loudly than to debug a flaky test.
  const seen = new Set<string>();
  for (const fixture of fixtures) {
    if (seen.has(fixture.name)) {
      throw new Error(`Duplicate schema fixture name '${fixture.name}' across fixture dirs`);
    }
    seen.add(fixture.name);
  }
  return fixtures;
}

function clearGeneratedDir(generatedDir: string, extension: string): void {
  if (!existsSync(generatedDir)) return;
  for (const entry of readdirSync(generatedDir, { withFileTypes: true })) {
    const entryPath = resolve(generatedDir, entry.name);
    if (entry.isDirectory()) {
      clearGeneratedDir(entryPath, extension);
      continue;
    }
    if (entry.name.endsWith(extension)) {
      rmSync(entryPath);
    }
  }
}

async function generateAll(platform: Platform, config: PlatformConfig): Promise<void> {
  console.log(`\n[${platform}] generating fixtures…`);
  clearGeneratedDir(config.generatedDir, config.generatedExtension);
  const fixtures = listSchemaFixtures(config.extraFixturesSchemasDirs);
  if (config.generate) {
    for (const fixture of fixtures) {
      const outFile = resolve(config.generatedDir, `${fixture.name}${config.generatedExtension}`);
      await config.generate(fixture.path, outFile);
      config.postProcessFile?.(outFile);
      console.log(`  → ${fixture.name} -> ${outFile}`);
    }
  }
  for (const extra of config.extraGenerations ?? []) {
    const targets = extra.onlyFixtures ? fixtures.filter(f => extra.onlyFixtures!.includes(f.name)) : fixtures;
    for (const fixture of targets) {
      const outFile = resolve(config.generatedDir, extra.subdir, `${fixture.name}${config.generatedExtension}`);
      await extra.generate(fixture.path, outFile);
      extra.postProcessFile?.(outFile);
      console.log(`  → [${extra.subdir}] ${fixture.name} -> ${outFile}`);
    }
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
  const targets: Platform[] =
    arg === 'all' || arg === '' ? ['python', 'swift', 'typescript', 'zod'] : [arg as Platform];

  for (const platform of targets) {
    if (!(platform in PLATFORMS)) {
      throw new Error(`Unknown platform "${platform}". Expected one of: python, swift, typescript, zod, all.`);
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
