import { type App, initializeApp } from 'firebase-admin/app';
import { type Firestore, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Firestore emulator round-trip: write a typed value, read it back, and
// validate the wire-shape result with the v4 Zod schema. This proves the
// schema's `z.instanceof(firestore.Timestamp)` and the strict-object shape
// match what the SDK actually produces.
import { UserRoleSchema, UserSchema } from '../generated/v4/users.js';
import { ensureEmulatorEnv } from './_helpers.js';

describe('users firebase-admin@13 round-trip (v4 zod schema)', () => {
  let app: App;
  let firestore: Firestore;

  beforeAll(() => {
    ensureEmulatorEnv();
    app = initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT }, 'zod-users-admin-app');
    firestore = getFirestore(app);
  });

  afterAll(async () => {
    await firestore.terminate();
  });

  it('round-trips a User document and validates it with UserSchema', async () => {
    const userIn = {
      username: 'alice',
      role: UserRoleSchema.parse('admin'),
      created_at: new Timestamp(1_700_000_000, 0),
    };

    const collection = firestore.collection(`test_${crypto.randomUUID().replaceAll('-', '')}`);
    const docRef = collection.doc(crypto.randomUUID());
    await docRef.set(userIn);

    const snapshot = await docRef.get();
    expect(snapshot.exists).toBe(true);

    const raw = snapshot.data();
    const parsed = UserSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe(userIn.username);
      expect(parsed.data.role).toBe(userIn.role);
      expect(parsed.data.created_at.toMillis()).toBe(userIn.created_at.toMillis());
    }
  });

  it('rejects a doc whose `role` was tampered with at the Firestore layer', async () => {
    const collection = firestore.collection(`test_${crypto.randomUUID().replaceAll('-', '')}`);
    const docRef = collection.doc(crypto.randomUUID());
    // Bypass the schema by writing untyped data straight to Firestore.
    await docRef.set({
      username: 'mallory',
      role: 'visitor',
      created_at: new Timestamp(1_700_000_000, 0),
    });

    const snapshot = await docRef.get();
    const parsed = UserSchema.safeParse(snapshot.data());
    expect(parsed.success).toBe(false);
  });
});
