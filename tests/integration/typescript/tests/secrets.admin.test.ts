import { type App, initializeApp } from 'firebase-admin/app';
import { type Firestore, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { Secret } from '../generated/secrets.js';

// Round-trips a `bytes`-typed document through the Firestore emulator using
// the **firebase-admin@13** SDK. The admin SDK represents bytes as Node.js
// `Buffer`s, which is the type our generator emits for the
// `firebase-admin@*` targets. This test asserts that:
//
//   1. A typed `Secret` constructed with `Buffer` values can be written to
//      the emulator without coercion.
//   2. Reading the same document back yields `Buffer`-shaped bytes.
//   3. The byte contents are preserved exactly (no UTF-8 round-tripping,
//      no base64 mangling, no truncation), including a `bytes` field
//      nested inside a list (`shards`).

const FIXTURES_ROOT = resolve(__dirname, '../../_fixtures');

interface SecretSample {
  label: string;
  payload_base64: string;
  checksum_base64: string;
  shards_base64: string[];
  created_at: string;
}

function loadSample(scenario: string, name: string): SecretSample {
  const samplePath = resolve(FIXTURES_ROOT, 'samples', scenario, `${name}.json`);
  return JSON.parse(readFileSync(samplePath, 'utf8')) as SecretSample;
}

function ensureEmulatorEnv(): void {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('FIRESTORE_EMULATOR_HOST is not set. Run via `yarn test:integration:typescript`.');
  }
  process.env.GOOGLE_CLOUD_PROJECT ??= 'demo-integration';
  process.env.GCLOUD_PROJECT ??= process.env.GOOGLE_CLOUD_PROJECT;
}

/**
 * Byte-level equality between any two byte views (Node `Buffer` or
 * plain `Uint8Array`). Avoids `Buffer.from(view)` so we don't have to
 * reconcile `Buffer` vs `Uint8Array<ArrayBufferLike>` under strict TS.
 */
function bytesEqual(a: Buffer | Uint8Array, b: Buffer | Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

describe('Secrets bytes round-trip (firebase-admin@13)', () => {
  let app: App;
  let firestore: Firestore;

  beforeAll(() => {
    ensureEmulatorEnv();
    app = initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT }, 'secrets-admin-test-app');
    firestore = getFirestore(app);
  });

  afterAll(async () => {
    await firestore.terminate();
  });

  it('round-trips a typed Secret document with Buffer-valued bytes fields through the emulator', async () => {
    const sample = loadSample('secrets', 'api-key');

    const payloadBuf = Buffer.from(sample.payload_base64, 'base64');
    const checksumBuf = Buffer.from(sample.checksum_base64, 'base64');
    const shardsBufs = sample.shards_base64.map(s => Buffer.from(s, 'base64'));

    // Sanity-check the test fixture itself: the base64 strings must decode
    // to non-empty bytes that are *not* coincidentally equal to each other,
    // otherwise an SDK that quietly aliased all bytes fields would still
    // pass.
    expect(payloadBuf.length).toBeGreaterThan(0);
    expect(checksumBuf.length).toBe(32);
    expect(shardsBufs.length).toBe(3);
    expect(bytesEqual(payloadBuf, checksumBuf)).toBe(false);

    const secretIn: Secret = {
      label: sample.label,
      payload: payloadBuf,
      checksum: checksumBuf,
      shards: shardsBufs,
      created_at: Timestamp.fromDate(new Date(sample.created_at)),
    };

    const collection = firestore.collection(`test_${crypto.randomUUID().replaceAll('-', '')}`);
    const docRef = collection.doc(crypto.randomUUID());
    await docRef.set(secretIn);

    const snapshot = await docRef.get();
    expect(snapshot.exists).toBe(true);

    const raw = snapshot.data() as Record<string, unknown>;
    // Wire-level expectations: the admin SDK returns bytes as Buffer
    // (which is a subclass of Uint8Array). We assert against the wider
    // Uint8Array contract so the test is robust against a future SDK that
    // might switch to plain typed arrays.
    expect(raw.payload).toBeInstanceOf(Uint8Array);
    expect(raw.checksum).toBeInstanceOf(Uint8Array);
    expect(Array.isArray(raw.shards)).toBe(true);
    for (const s of raw.shards as unknown[]) {
      expect(s).toBeInstanceOf(Uint8Array);
    }

    const secretOut = snapshot.data() as Secret;

    expect(secretOut.label).toBe(secretIn.label);
    expect(bytesEqual(secretOut.payload, payloadBuf)).toBe(true);
    expect(bytesEqual(secretOut.checksum, checksumBuf)).toBe(true);
    expect(secretOut.shards.length).toBe(shardsBufs.length);
    secretOut.shards.forEach((shard, i) => {
      const expected = shardsBufs[i];
      expect(expected).toBeDefined();
      expect(bytesEqual(shard, expected!)).toBe(true);
    });
    expect(secretOut.created_at.toMillis()).toBe(secretIn.created_at.toMillis());
  });
});
