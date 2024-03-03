import type { DefModelField } from '../definition';
import type { SchemaModelField } from '../interfaces';
import { convertDefValueTypeToSchemaValueType } from './converters';

class SchemaModelFieldImpl implements SchemaModelField {
  public constructor(
    public readonly name: string,
    private readonly defModelField: DefModelField
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

export function createSchemaModelField(name: string, defModelField: DefModelField): SchemaModelField {
  return new SchemaModelFieldImpl(name, defModelField);
}
