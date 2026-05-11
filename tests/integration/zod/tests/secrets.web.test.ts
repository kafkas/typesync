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
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SecretSchema } from '../generated/v4-web/secrets.js';
import { ensureEmulatorEnv, loadSample } from './_helpers.js';

interface SecretSample {
  label: string;
  payload_base64: string;
  checksum_base64: string;
  shards_base64: string[];
  created_at: string;
}

describe('secrets firebase web SDK round-trip (v4 zod schema)', () => {
  let app: FirebaseApp;
  let firestore: Firestore;

  beforeAll(() => {
    const { host, port } = ensureEmulatorEnv();
    app = initializeWebApp(
      {
        apiKey: 'fake-api-key',
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
      },
      'zod-secrets-web-app'
    );
    firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, host, port);
  });

  afterAll(async () => {
    await terminate(firestore);
  });

  it("validates a Secret read from the emulator with the web SDK's `firestore.Bytes` shape", async () => {
    const sample = loadSample('secrets', 'api-key') as SecretSample;
    const secretIn = {
      label: sample.label,
      payload: Bytes.fromBase64String(sample.payload_base64),
      checksum: Bytes.fromBase64String(sample.checksum_base64),
      shards: sample.shards_base64.map(s => Bytes.fromBase64String(s)),
      created_at: Timestamp.fromDate(new Date(sample.created_at)),
    };

    const collection = `test_${crypto.randomUUID().replaceAll('-', '')}`;
    const docRef = doc(firestore, collection, crypto.randomUUID());
    await setDoc(docRef, secretIn);

    const snapshot = await getDoc(docRef);
    expect(snapshot.exists()).toBe(true);

    const parsed = SecretSchema.safeParse(snapshot.data());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.label).toBe(secretIn.label);
      expect(parsed.data.payload).toBeInstanceOf(Bytes);
      expect(parsed.data.payload.isEqual(secretIn.payload)).toBe(true);
      expect(parsed.data.shards).toHaveLength(secretIn.shards.length);
      expect(parsed.data.created_at.toMillis()).toBe(secretIn.created_at.toMillis());
    }
  });
});
