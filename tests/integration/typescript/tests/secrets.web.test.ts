import { type FirebaseApp, initializeApp as initializeWebApp } from 'firebase/app';
import {
  Bytes,
  type Firestore,
  Timestamp,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  terminate,
} from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { Secret } from '../generated/web/secrets.js';

// Round-trips a `bytes`-typed document through the Firestore emulator using
// the **firebase@10 web SDK**. Where the admin SDK uses `Buffer`, the web
// SDK exposes bytes through the immutable `Bytes` value type. Our generator
// emits `firestore.Bytes` for the `firebase@*` targets, and this test
// proves that the generated type is the right one in practice:
//
//   1. A typed `Secret` constructed with `Bytes.fromUint8Array(...)`
//      values is accepted by `setDoc` without coercion.
//   2. Reading back with `getDoc` returns `Bytes` instances for every
//      bytes-typed field, including bytes nested inside a list.
//   3. The byte contents are preserved exactly when round-tripped through
//      base64.
//
// Confirming both the admin (`Buffer`) and web (`Bytes`) shapes via the
// emulator is the integration-level proof that the cross-target plumbing
// for the `bytes` primitive really works.

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

function ensureEmulatorEnv(): { host: string; port: number } {
  const raw = process.env.FIRESTORE_EMULATOR_HOST;
  if (!raw) {
    throw new Error('FIRESTORE_EMULATOR_HOST is not set. Run via `yarn test:integration:typescript`.');
  }
  // FIRESTORE_EMULATOR_HOST is conventionally `host:port`, e.g.
  // `localhost:8080`. The web SDK takes them as separate args.
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
  return { host, port };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('Secrets bytes round-trip (firebase@10 web SDK)', () => {
  let app: FirebaseApp;
  let firestore: Firestore;

  beforeAll(() => {
    const { host, port } = ensureEmulatorEnv();
    app = initializeWebApp(
      {
        // Placeholder credentials. The emulator does not validate them
        // and we never reach a real Firebase project.
        apiKey: 'fake-api-key',
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
      },
      'secrets-web-test-app'
    );
    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, host, port);
  });

  afterAll(async () => {
    await terminate(firestore);
  });

  it('round-trips a typed Secret document with firestore.Bytes values through the emulator', async () => {
    const sample = loadSample('secrets', 'api-key');

    const payloadBytes = Bytes.fromBase64String(sample.payload_base64);
    const checksumBytes = Bytes.fromBase64String(sample.checksum_base64);
    const shardsBytes = sample.shards_base64.map(s => Bytes.fromBase64String(s));

    // Sanity-check the fixture so a buggy `Bytes` implementation that
    // collapsed every input to the same value would still be caught.
    expect(payloadBytes.toBase64()).toBe(sample.payload_base64);
    expect(checksumBytes.toBase64()).toBe(sample.checksum_base64);
    expect(payloadBytes.isEqual(checksumBytes)).toBe(false);

    const secretIn: Secret = {
      label: sample.label,
      payload: payloadBytes,
      checksum: checksumBytes,
      shards: shardsBytes,
      created_at: Timestamp.fromDate(new Date(sample.created_at)),
    };

    const collection = `test_${crypto.randomUUID().replaceAll('-', '')}`;
    const docRef = doc(firestore, collection, crypto.randomUUID());
    await setDoc(docRef, secretIn);

    const snapshot = await getDoc(docRef);
    expect(snapshot.exists()).toBe(true);

    const raw = snapshot.data() as Record<string, unknown>;
    // Wire-level expectations: the web SDK exposes bytes as the `Bytes`
    // value type, including for entries nested inside a list.
    expect(raw.payload).toBeInstanceOf(Bytes);
    expect(raw.checksum).toBeInstanceOf(Bytes);
    expect(Array.isArray(raw.shards)).toBe(true);
    for (const s of raw.shards as unknown[]) {
      expect(s).toBeInstanceOf(Bytes);
    }

    const secretOut = snapshot.data() as Secret;

    expect(secretOut.label).toBe(secretIn.label);
    expect(secretOut.payload.isEqual(payloadBytes)).toBe(true);
    expect(secretOut.checksum.isEqual(checksumBytes)).toBe(true);
    expect(secretOut.shards.length).toBe(shardsBytes.length);
    secretOut.shards.forEach((shard, i) => {
      const expected = shardsBytes[i];
      expect(expected).toBeDefined();
      expect(shard.isEqual(expected!)).toBe(true);
      // And the underlying byte contents should match the source fixture.
      expect(bytesToHex(shard.toUint8Array())).toBe(bytesToHex(expected!.toUint8Array()));
    });
    expect(secretOut.created_at.toMillis()).toBe(secretIn.created_at.toMillis());
  });
});
