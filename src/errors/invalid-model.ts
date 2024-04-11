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
