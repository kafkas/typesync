import type { DefModelField, DefValueType } from '../../definition';
import type { SchemaModelField, SchemaValueType } from '../../interfaces';

export function convertDefModelFieldToSchemaModelField(
  fieldName: string,
  defModelField: DefModelField
): SchemaModelField {
  return {
    type: convertDefValueTypeToSchemaValueType(defModelField.type),
    optional: !!defModelField.optional,
    docs: defModelField.docs,
    name: fieldName,
  };
}

export function convertDefValueTypeToSchemaValueType(defValueType: DefValueType): SchemaValueType {
  switch (defValueType) {
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'boolean' };
    case 'int':
      return { type: 'int' };
    case 'timestamp':
      return { type: 'timestamp' };
  }

  if (typeof defValueType === 'string') {
    return { type: 'alias', name: defValueType };
  }

  switch (defValueType.type) {
    case 'enum': {
      return {
        type: 'enum',
        items: defValueType.items,
      };
    }
    case 'map':
      return {
        type: 'map',
        fields: Object.entries(defValueType.fields).map(([fieldName, defModelField]) =>
          convertDefModelFieldToSchemaModelField(fieldName, defModelField)
        ),
      };
  }
}
