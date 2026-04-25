import admin from 'firebase-admin';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  FirebaseAdminInitError,
  MissingFirebaseCredentialsError,
  ServiceAccountFileNotFoundError,
  ServiceAccountFileNotValidError,
} from '../../errors/validate-data.js';
import { extractErrorMessage } from '../../util/extract-error-message.js';

export interface FirebaseAdminInitOptions {
  serviceAccountPath?: string;
  projectId?: string;
  emulatorHost?: string;
}

/**
 * Initializes a dedicated Firebase Admin app for the validation run. The app is
 * namespaced so that it never collides with any other admin app the host process
 * might have already created.
 */
export function initFirebaseAdminApp(opts: FirebaseAdminInitOptions): admin.app.App {
  const { serviceAccountPath, projectId, emulatorHost } = opts;

  if (emulatorHost) {
    process.env['FIRESTORE_EMULATOR_HOST'] = emulatorHost;
  }

  const hasServiceAccountPath = !!serviceAccountPath;
  const hasEnvCredentials = !!process.env['GOOGLE_APPLICATION_CREDENTIALS'];
  const targetingEmulator = !!emulatorHost || !!process.env['FIRESTORE_EMULATOR_HOST'];

  if (!hasServiceAccountPath && !hasEnvCredentials && !targetingEmulator) {
    throw new MissingFirebaseCredentialsError();
  }

  const appName = `typesync-validate-data-${Date.now()}`;

  try {
    if (hasServiceAccountPath) {
      const credential = loadServiceAccountCredential(serviceAccountPath);
      return admin.initializeApp(
        {
          credential,
          projectId,
        },
        appName
      );
    }

    return admin.initializeApp(
      {
        credential: admin.credential.applicationDefault(),
        projectId,
      },
      appName
    );
  } catch (e) {
    if (e instanceof ServiceAccountFileNotFoundError || e instanceof ServiceAccountFileNotValidError) throw e;
    throw new FirebaseAdminInitError(extractErrorMessage(e));
  }
}

function loadServiceAccountCredential(pathToFile: string): admin.credential.Credential {
  const absolutePath = resolve(process.cwd(), pathToFile);
  let raw: string;
  try {
    raw = readFileSync(absolutePath, 'utf-8');
  } catch {
    throw new ServiceAccountFileNotFoundError(absolutePath);
  }
  let parsed: admin.ServiceAccount;
  try {
    parsed = JSON.parse(raw) as admin.ServiceAccount;
  } catch (e) {
    throw new ServiceAccountFileNotValidError(absolutePath, extractErrorMessage(e));
  }
  return admin.credential.cert(parsed);
}
