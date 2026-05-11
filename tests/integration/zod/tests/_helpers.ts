import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SHARED_FIXTURES_ROOT = resolve(__dirname, '../../_fixtures');
const ZOD_FIXTURES_ROOT = resolve(__dirname, '../_fixtures');

/**
 * Loads a JSON fixture by scenario + name. Looks under the Zod-only fixtures
 * dir first, then falls back to the shared fixtures dir. The fallback lets
 * test files reference shared scenarios (`users`, `secrets`, `projects`)
 * the same way as zod-only ones (`catalog`).
 */
export function loadSample(scenario: string, name: string): unknown {
  for (const root of [ZOD_FIXTURES_ROOT, SHARED_FIXTURES_ROOT]) {
    const candidate = resolve(root, 'samples', scenario, `${name}.json`);
    try {
      return JSON.parse(readFileSync(candidate, 'utf8'));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
  throw new Error(`Could not find sample '${scenario}/${name}.json' under either Zod-only or shared fixtures.`);
}

export function ensureEmulatorEnv(): { host: string; port: number } {
  const raw = process.env.FIRESTORE_EMULATOR_HOST;
  if (!raw) {
    throw new Error('FIRESTORE_EMULATOR_HOST is not set. Run via `yarn test:integration:zod`.');
  }
  const lastColon = raw.lastIndexOf(':');
  if (lastColon < 0) {
    throw new Error(`FIRESTORE_EMULATOR_HOST=${raw} is not in host:port form`);
  }
  const host = raw.slice(0, lastColon);
  const port = Number(raw.slice(lastColon + 1));
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`FIRESTORE_EMULATOR_HOST=${raw} has an invalid port`);
  }
  process.env.GOOGLE_CLOUD_PROJECT ??= 'demo-integration';
  process.env.GCLOUD_PROJECT ??= process.env.GOOGLE_CLOUD_PROJECT;
  return { host, port };
}
