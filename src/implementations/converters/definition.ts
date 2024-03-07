import type { definition } from '../../definition';
import type { schema } from '../../schema';
import { assertNever } from '../../util/assert';

export function convertDefModelFieldToSchemaModelField(
  fieldName: string,
  defModelField: definition.ModelField
): schema.ModelField {
  return {
    type: convertDefValueTypeToSchemaValueType(defModelField.type),
    optional: !!defModelField.optional,
    docs: defModelField.docs,
    name: fieldName,
  };
}

export function convertDefValueTypeToSchemaValueType(defValueType: definition.ValueType): schema.ValueType {
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
    case 'tuple':
      return {
        type: 'tuple',
        values: defValueType.values.map(convertDefValueTypeToSchemaValueType),
      };
    case 'list':
      return {
        type: 'list',
        of: convertDefValueTypeToSchemaValueType(defValueType.of),
      };
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
): schema.PrimitiveValueType {
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
