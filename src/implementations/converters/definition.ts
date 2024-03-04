import type { DefModelField, DefPrimitiveValueType, DefValueType } from '../../definition';
import type { SchemaModelField, SchemaPrimitiveValueType, SchemaValueType } from '../../interfaces';
import { assertNever } from '../../util/assert';

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
  if (isDefPrimitiveValueType(defValueType)) {
    return convertDefPrimitiveValueTypeToSchemaPrimitiveValueType(defValueType);
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
    default:
      assertNever(defValueType);
  }
}

function isDefPrimitiveValueType(candidate: unknown): candidate is DefPrimitiveValueType {
  if (typeof candidate !== 'string') {
    return false;
  }
  try {
    convertDefPrimitiveValueTypeToSchemaPrimitiveValueType(candidate as DefPrimitiveValueType);
    return true;
  } catch {
    return false;
  }
}

export function convertDefPrimitiveValueTypeToSchemaPrimitiveValueType(
  defValueType: DefPrimitiveValueType
): SchemaPrimitiveValueType {
  switch (defValueType) {
    case 'nil':
      return { type: 'nil' };
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'boolean' };
    case 'int':
      return { type: 'int' };
    case 'timestamp':
      return { type: 'timestamp' };
    default:
      assertNever(defValueType);
  }
}
