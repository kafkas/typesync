export class SchemaNotValidYamlError extends Error {
  public constructor(pathToSchema: string) {
    super(`The schema is not a valid YAML file. Could not parse file ${pathToSchema}`);
  }
}
