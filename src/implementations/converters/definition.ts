import type { definition } from '../../definition';
import type { SchemaModelField, SchemaPrimitiveValueType, SchemaValueType } from '../../interfaces';
import { assertNever } from '../../util/assert';

export function convertDefModelFieldToSchemaModelField(
  fieldName: string,
  defModelField: definition.ModelField
): SchemaModelField {
  return {
    type: convertDefValueTypeToSchemaValueType(defModelField.type),
    optional: !!defModelField.optional,
    docs: defModelField.docs,
    name: fieldName,
  };
}

export function convertDefValueTypeToSchemaValueType(defValueType: definition.ValueType): SchemaValueType {
  if (isDefPrimitiveValueType(defValueType)) {
    return convertDefPrimitiveValueTypeToSchemaPrimitiveValueType(defValueType);
  }

  if (typeof defValueType === 'string') {
    return { type: 'alias', name: defValueType };
  }

  if (Array.isArray(defValueType)) {
    return {
      type: 'union',
      members: defValueType.map(convertDefValueTypeToSchemaValueType),
    };
  }

  switch (defValueType.type) {
    case 'literal':
      return {
        type: 'literal',
        value: defValueType.value,
      };
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

function isDefPrimitiveValueType(candidate: unknown): candidate is definition.PrimitiveValueType {
  if (typeof candidate !== 'string') {
    return false;
  }
  try {
    convertDefPrimitiveValueTypeToSchemaPrimitiveValueType(candidate as definition.PrimitiveValueType);
    return true;
  } catch {
    return false;
  }
}

export function convertDefPrimitiveValueTypeToSchemaPrimitiveValueType(
  defValueType: definition.PrimitiveValueType
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
