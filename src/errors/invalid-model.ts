export class InvalidAliasModelError extends Error {
  public constructor(modelName: string, message: string) {
    super(`The alias model '${modelName}' is not valid. ${message}`);
  }
}

export class InvalidDocumentModelError extends Error {
  public constructor(modelName: string, message: string) {
    super(`The document model '${modelName}' is not valid. ${message}`);
  }
}
