import {
  type RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { Bytes, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadFirestoreRules(): string {
  const pathToRules = resolve(__dirname, './firestore.rules');
  return readFileSync(pathToRules, 'utf8');
}

describe('Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  const userId = 'user123';
  const userDocPath = `/users/${userId}`;
  const projectId = 'project123';
  const projectDocPath = `/projects/${projectId}`;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      firestore: {
        rules: loadFirestoreRules(),
      },
    });
  });

  it('blocks create if the data object has incorrect shape', async () => {
    const ctx = testEnv.unauthenticatedContext();
    const userDocRef = doc(ctx.firestore(), userDocPath);
    await expect(
      assertFails(
        setDoc(userDocRef, {
          someField: 123,
        })
      )
    ).resolves.toBeDefined();
  });

  it('allows create if the rules are relaxed', async () => {
    const ctx = testEnv.unauthenticatedContext();
    const projectDocRef = doc(ctx.firestore(), projectDocPath);
    await expect(
      assertSucceeds(
        setDoc(projectDocRef, {
          someField: 'abc',
        })
      )
    ).resolves.toBeUndefined();
  });

  it('allows update if existing read-only fields are not affected', async () => {
    const ctx = testEnv.unauthenticatedContext();
    const userDocRef = doc(ctx.firestore(), userDocPath);
    await setDoc(userDocRef, {
      name: 'John Appleseed',
      role: 'member',
      created_at: new Date(),
    });
    await expect(
      assertSucceeds(
        updateDoc(userDocRef, {
          name: 'James',
        })
      )
    ).resolves.toBeUndefined();
  });

  it('blocks update if a read-only field is affected', async () => {
    const ctx = testEnv.unauthenticatedContext();
    const userDocRef = doc(ctx.firestore(), userDocPath);
    await setDoc(userDocRef, {
      name: 'John Appleseed',
      role: 'member',
      created_at: new Date(),
    });
    await expect(
      assertFails(
        updateDoc(userDocRef, {
          role: 'admin',
        })
      )
    ).resolves.toBeDefined();
  });

  // The /secrets/* collection exercises the `bytes` primitive end-to-end:
  // the rules generator should emit `data.<field> is bytes`, and the
  // emulator should evaluate that predicate against `firestore.Bytes`
  // values written from the web SDK. These tests prove both halves at
  // runtime and not just via snapshot-of-generator-output.
  describe('bytes', () => {
    const secretId = 'secret123';
    const secretDocPath = `/secrets/${secretId}`;

    it('allows create when bytes-typed fields are sent as firestore.Bytes', async () => {
      const ctx = testEnv.unauthenticatedContext();
      const ref = doc(ctx.firestore(), secretDocPath);
      await expect(
        assertSucceeds(
          setDoc(ref, {
            label: 'primary',
            payload: Bytes.fromUint8Array(new Uint8Array([0x01, 0x02, 0x03, 0x04])),
            checksum: Bytes.fromBase64String('MV9b23bQeMQ7isAGTkoBZGErH853yGk0W/yUx1iU7dM='),
          })
        )
      ).resolves.toBeUndefined();

      // And the document is readable back as bytes (sanity-check that
      // the emulator did not reject silently or coerce to a string).
      const snapshot = await getDoc(ref);
      expect(snapshot.exists()).toBe(true);
      const raw = snapshot.data() as Record<string, unknown>;
      expect(raw.payload).toBeInstanceOf(Bytes);
      expect(raw.checksum).toBeInstanceOf(Bytes);
    });

    it('blocks create when a bytes-typed field is sent as a string', async () => {
      const ctx = testEnv.unauthenticatedContext();
      const ref = doc(ctx.firestore(), secretDocPath);
      await expect(
        assertFails(
          setDoc(ref, {
            label: 'primary',
            payload: 'not-bytes-just-a-string',
            checksum: Bytes.fromUint8Array(new Uint8Array(32)),
          })
        )
      ).resolves.toBeDefined();
    });

    it('blocks create when a bytes-typed field is sent as a number', async () => {
      const ctx = testEnv.unauthenticatedContext();
      const ref = doc(ctx.firestore(), secretDocPath);
      await expect(
        assertFails(
          setDoc(ref, {
            label: 'primary',
            payload: Bytes.fromUint8Array(new Uint8Array([0xff])),
            checksum: 12345,
          })
        )
      ).resolves.toBeDefined();
    });

    it('blocks create when a bytes-typed field is missing entirely', async () => {
      const ctx = testEnv.unauthenticatedContext();
      const ref = doc(ctx.firestore(), secretDocPath);
      await expect(
        assertFails(
          setDoc(ref, {
            label: 'primary',
            payload: Bytes.fromUint8Array(new Uint8Array([0xff])),
            // checksum: missing
          })
        )
      ).resolves.toBeDefined();
    });
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });
});
