export class DefinitionNotValidYamlError extends Error {
  public constructor(pathToDefinition: string) {
    super(`The definition is not a valid YAML file. Could not parse file ${pathToDefinition}`);
  }
}

export class DefinitionNotValidError extends Error {
  public constructor(path: string, message: string) {
    super(`The specified file is not a valid TypeSync definition. Invalid value at path '${path}': ${message}`);
  }
}
