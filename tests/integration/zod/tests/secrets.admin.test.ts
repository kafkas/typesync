import { type App, initializeApp } from 'firebase-admin/app';
import { type Firestore, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SecretSchema } from '../generated/v4/secrets.js';
import { ensureEmulatorEnv, loadSample } from './_helpers.js';

interface SecretSample {
  label: string;
  payload_base64: string;
  checksum_base64: string;
  shards_base64: string[];
  created_at: string;
}

describe('secrets firebase-admin@13 round-trip (v4 zod schema)', () => {
  let app: App;
  let firestore: Firestore;

  beforeAll(() => {
    ensureEmulatorEnv();
    app = initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT }, 'zod-secrets-admin-app');
    firestore = getFirestore(app);
  });

  afterAll(async () => {
    await firestore.terminate();
  });

  it("validates a Secret read from the emulator with the admin SDK's Buffer-shaped bytes", async () => {
    const sample = loadSample('secrets', 'api-key') as SecretSample;
    const secretIn = {
      label: sample.label,
      payload: Buffer.from(sample.payload_base64, 'base64'),
      checksum: Buffer.from(sample.checksum_base64, 'base64'),
      shards: sample.shards_base64.map(s => Buffer.from(s, 'base64')),
      created_at: Timestamp.fromDate(new Date(sample.created_at)),
    };

    const collection = firestore.collection(`test_${crypto.randomUUID().replaceAll('-', '')}`);
    const docRef = collection.doc(crypto.randomUUID());
    await docRef.set(secretIn);

    const snapshot = await docRef.get();
    expect(snapshot.exists).toBe(true);

    const parsed = SecretSchema.safeParse(snapshot.data());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.label).toBe(secretIn.label);
      // The admin SDK returns bytes as Uint8Array (Buffer subclass).
      expect(parsed.data.payload).toBeInstanceOf(Uint8Array);
      expect(parsed.data.shards).toHaveLength(secretIn.shards.length);
      expect(parsed.data.created_at.toMillis()).toBe(secretIn.created_at.toMillis());
    }
  });
});
