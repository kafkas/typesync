export class SchemaNotValidYamlError extends Error {
  public constructor(pathToSchema: string) {
    super(`The schema is not a valid YAML file. Could not parse file ${pathToSchema}`);
  }
}

export class SchemaNotValidError extends Error {
  public constructor(path: string, message: string) {
    super(`The specified file is not a valid TypeSync schema. Invalid value at path '${path}': ${message}`);
  }
}
