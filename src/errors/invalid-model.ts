export class InvalidModelError extends Error {
  public constructor(modelName: string, message: string) {
    super(`The schema model '${modelName}' is not valid. ${message}`);
  }
}

export class DuplicateModelError extends InvalidModelError {
  public constructor(modelName: string) {
    super(modelName, `The schema already has a '${modelName}' model. Duplicates are not allowed.`);
  }
}

export class ModelPathRefersToCollectionError extends InvalidModelError {
  public constructor(modelName: string, path: string) {
    super(
      modelName,
      `The path '${path}' refers to a Firestore collection. Document model paths must represent a distinct Firestore document, either generically or literally. Example valid paths include 'users/{userId}' and '{rootCollectionId}/data/projects/project123'.`
    );
  }
}

export class ModelPathContainsLeadingSlashError extends InvalidModelError {
  public constructor(modelName: string, path: string) {
    super(
      modelName,
      `The path '${path}' starts with a leading slash '/'. A document model path may not contain a leading slash. Example valid paths include 'users/{userId}' and '{rootCollectionId}/data/projects/project123'.`
    );
  }
}

export class ModelPathContainsTrailingSlashError extends InvalidModelError {
  public constructor(modelName: string, path: string) {
    super(
      modelName,
      `The path '${path}' ends with a trailing slash '/'. A document model path may not contain a trailing slash. Example valid paths include 'users/{userId}' and '{rootCollectionId}/data/projects/project123'.`
    );
  }
}

export class ModelPathInvalidError extends InvalidModelError {
  public constructor(modelName: string, path: string) {
    super(
      modelName,
      `The path '${path}' is not valid. A document model path must represent a distinct Firestore document, either generically or literally. Example valid paths include 'users/{userId}' and '{rootCollectionId}/data/projects/project123'.`
    );
  }
}
