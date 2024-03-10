import { definition } from '../definition';
import type { schema } from '../schema';

class SchemaModelFieldImpl implements schema.types.Field {
  public constructor(
    public readonly name: string,
    private readonly defModelField: definition.ModelField
  ) {}

  public get type() {
    return definition.convertValueTypeToSchema(this.defModelField.type);
  }

  public get optional() {
    return !!this.defModelField.optional;
  }

  public get docs() {
    return this.defModelField.docs;
  }
}

export function createSchemaModelField(name: string, defModelField: definition.ModelField): schema.types.Field {
  return new SchemaModelFieldImpl(name, defModelField);
}
