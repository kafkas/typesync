import {
  type RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
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
  const projectId = 'projectId';
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
          someField: 123,
        })
      )
    ).resolves.toBeUndefined();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });
});
