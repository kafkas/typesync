export class ValidateDataError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export class FirebaseAdminInitError extends ValidateDataError {
  public constructor(reason: string) {
    super(`Failed to initialize the Firebase Admin SDK. ${reason}`);
  }
}

export class ServiceAccountFileNotFoundError extends ValidateDataError {
  public constructor(pathToFile: string) {
    super(
      `The service account key file was not found at '${pathToFile}'. Provide a valid path with --serviceAccount or set GOOGLE_APPLICATION_CREDENTIALS.`
    );
  }
}

export class ServiceAccountFileNotValidError extends ValidateDataError {
  public constructor(pathToFile: string, reason: string) {
    super(`The service account key file at '${pathToFile}' could not be parsed as JSON. ${reason}`);
  }
}

export class MissingFirebaseCredentialsError extends ValidateDataError {
  public constructor() {
    super(
      'No Firebase credentials were provided. Pass --serviceAccount <path>, set GOOGLE_APPLICATION_CREDENTIALS, or use --emulatorHost with --projectId to target the emulator.'
    );
  }
}

export class FirestorePermissionDeniedError extends ValidateDataError {
  public constructor(collectionPath: string, reason: string) {
    super(
      `Firestore denied access to the collection '${collectionPath}'. ${reason} Check that the credentials you provided have read access to this collection.`
    );
  }
}

export class FirestoreTraversalError extends ValidateDataError {
  public constructor(collectionPath: string, reason: string) {
    super(`Firestore traversal failed for collection '${collectionPath}'. ${reason}`);
  }
}
