import { definition } from '../definition';
import type { schema } from '../schema';

class SchemaModelFieldImpl implements schema.types.Field {
  public constructor(
    public readonly name: string,
    private readonly defModelField: definition.types.Field
  ) {}

  public get type() {
    return definition.convertTypeToSchema(this.defModelField.type);
  }

  public get optional() {
    return !!this.defModelField.optional;
  }

  public get docs() {
    return this.defModelField.docs;
  }
}

export function createSchemaModelField(name: string, defModelField: definition.types.Field): schema.types.Field {
  return new SchemaModelFieldImpl(name, defModelField);
}
