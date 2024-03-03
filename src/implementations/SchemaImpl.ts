import type { Schema, SchemaJson } from '../interfaces';

class SchemaImpl implements Schema {
  public constructor(private readonly schemaJson: SchemaJson) {}
}

export function createSchema(schemaJson: SchemaJson): Schema {
  return new SchemaImpl(schemaJson);
}
