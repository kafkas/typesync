import type { SchemaModelField, SchemaModelFieldJson } from '../interfaces';

class SchemaModelFieldImpl implements SchemaModelField {
  public constructor(
    public readonly name: string,
    private readonly fieldJson: SchemaModelFieldJson
  ) {}

  public get type() {
    return this.fieldJson.type;
  }

  public get optional() {
    return !!this.fieldJson.optional;
  }

  public get docs() {
    return this.fieldJson.docs;
  }
}

export function createSchemaModelField(name: string, fieldJson: SchemaModelFieldJson): SchemaModelField {
  return new SchemaModelFieldImpl(name, fieldJson);
}
