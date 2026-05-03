import { type App, initializeApp } from 'firebase-admin/app';
import { type Firestore, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { User, UserRole } from '../generated/users.js';

const FIXTURES_ROOT = resolve(__dirname, '../../_fixtures');

function loadSample(scenario: string, name: string): unknown {
  const samplePath = resolve(FIXTURES_ROOT, 'samples', scenario, `${name}.json`);
  return JSON.parse(readFileSync(samplePath, 'utf8'));
}

function ensureEmulatorEnv(): void {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIRESTORE_EMULATOR_HOST is not set. Run via `yarn test:integration:typescript`.');
  }
  process.env.GOOGLE_CLOUD_PROJECT ??= 'demo-integration';
  process.env.GCLOUD_PROJECT ??= process.env.GOOGLE_CLOUD_PROJECT;
}

describe('Users (firebase-admin@13)', () => {
  let app: App;
  let firestore: Firestore;

  beforeAll(() => {
    ensureEmulatorEnv();
    app = initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
    firestore = getFirestore(app);
  });

  afterAll(async () => {
    await firestore.terminate();
  });

  it('round-trips a typed User document through the emulator', async () => {
    const sample = loadSample('users', 'john') as {
      username: string;
      role: string;
      created_at: string;
    };

    const userIn: User = {
      username: sample.username,
      role: sample.role as UserRole,
      created_at: Timestamp.fromDate(new Date(sample.created_at)),
    };

    const collection = firestore.collection(`test_${crypto.randomUUID().replaceAll('-', '')}`);
    const docRef = collection.doc(crypto.randomUUID());
    await docRef.set(userIn);

    const snapshot = await docRef.get();
    expect(snapshot.exists).toBe(true);

    const userOut = snapshot.data() as User;

    expect(userOut.username).toBe(userIn.username);
    expect(userOut.role).toBe(userIn.role);
    expect(userOut.created_at.toMillis()).toBe(userIn.created_at.toMillis());
  });

  it('rejects values that do not match the generated UserRole alias', () => {
    // The point of this test is the *compile-time* failure expressed below;
    // the runtime body is a no-op. If a regression makes UserRole permissive,
    // the @ts-expect-error comment will start to fail, and tsc will surface
    // it during `yarn test:integration:typescript`.

    // @ts-expect-error: 'visitor' is not a valid UserRole.
    const _bad: UserRole = 'visitor';
    expect(_bad).toBeDefined();
  });
});
