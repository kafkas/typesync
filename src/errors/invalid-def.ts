export class DefinitionNotValidError extends Error {
  public constructor(message: string) {
    super(`The specified definition is not valid. ${message}`);
  }
}

export class DefinitionFilesNotFoundError extends DefinitionNotValidError {
  public constructor(globPattern: string) {
    super(`No files were found matching the path or pattern '${globPattern}'`);
  }
}

export class DefinitionFileNotValidYamlOrJsonError extends DefinitionNotValidError {
  public constructor(filePath: string) {
    super(`The definition file '${filePath}' is not a valid YAML or JSON file. Failed to parse the file.`);
  }
}

export class DefinitionFileFieldNotValidError extends DefinitionNotValidError {
  public constructor(filePath: string, path: string, message: string) {
    super(`The definition file '${filePath}' has an invalid field. Invalid value at path '${path}': ${message}`);
  }
}

export class DuplicateModelNameError extends DefinitionNotValidError {
  public constructor(filePath: string, modelName: string) {
    super(
      `The model name '${modelName}' has been used multiple times. Last observed in file '${filePath}'. Model names must be unique within a Typesync definition.`
    );
  }
}
