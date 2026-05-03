import { type App, initializeApp } from 'firebase-admin/app';
import { type Firestore, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { Project } from '../generated/projects.js';

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

describe('Projects (firebase-admin@13)', () => {
  let app: App;
  let firestore: Firestore;

  beforeAll(() => {
    ensureEmulatorEnv();
    app = initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT }, 'projects-test-app');
    firestore = getFirestore(app);
  });

  afterAll(async () => {
    await firestore.terminate();
  });

  it('round-trips a typed Project document with a body-side `id` field', async () => {
    const sample = loadSample('projects', 'typesync') as {
      id: string;
      display_name: string;
      created_at: string;
    };

    const projectIn: Project = {
      id: sample.id,
      display_name: sample.display_name,
      created_at: Timestamp.fromDate(new Date(sample.created_at)),
    };

    const collection = firestore.collection(`test_${crypto.randomUUID().replaceAll('-', '')}`);
    const docRef = collection.doc(crypto.randomUUID());
    await docRef.set(projectIn);

    const snapshot = await docRef.get();
    expect(snapshot.exists).toBe(true);

    const projectOut = snapshot.data() as Project;

    expect(projectOut.id).toBe(projectIn.id);
    expect(projectOut.display_name).toBe(projectIn.display_name);
    expect(projectOut.created_at.toMillis()).toBe(projectIn.created_at.toMillis());
  });

  it('does not surface the field-level swift.name rename in the TypeScript type', () => {
    // The field-level `swift: { name: 'displayName' }` is consumed exclusively
    // by the Swift generator. The TypeScript type must still expose the field
    // under its schema name (`display_name`); `displayName` is not a valid key.
    const _bad: Project = {
      id: 'x',
      // @ts-expect-error: `displayName` is the Swift property name; the wire key remains `display_name`.
      displayName: 'should-not-compile',
      display_name: 'x',
      created_at: Timestamp.fromMillis(0),
    };
    expect(_bad).toBeDefined();
  });

  it('does not surface the model-level swift.documentIdProperty rename in the TypeScript type', () => {
    // The model-level `swift: { documentIdProperty: { name: 'documentId' } }`
    // is consumed exclusively by the Swift generator. `documentId` must not
    // be a valid key on the TS Project body.
    const _bad: Project = {
      id: 'x',
      // @ts-expect-error: `documentId` is only the Swift @DocumentID property name; it should not exist on the TS body.
      documentId: 'should-not-compile',
      display_name: 'x',
      created_at: Timestamp.fromMillis(0),
    };
    expect(_bad).toBeDefined();
  });
});
