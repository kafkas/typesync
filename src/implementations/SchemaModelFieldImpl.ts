import type { definition } from '../definition';
import type { schema } from '../interfaces';
import { convertDefValueTypeToSchemaValueType } from './converters';

class SchemaModelFieldImpl implements schema.ModelField {
  public constructor(
    public readonly name: string,
    private readonly defModelField: definition.ModelField
  ) {}

  public get type() {
    return convertDefValueTypeToSchemaValueType(this.defModelField.type);
  }

  public get optional() {
    return !!this.defModelField.optional;
  }

  public get docs() {
    return this.defModelField.docs;
  }
}

export function createSchemaModelField(name: string, defModelField: definition.ModelField): schema.ModelField {
  return new SchemaModelFieldImpl(name, defModelField);
}
