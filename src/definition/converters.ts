import type { schema } from '../schema';
import { assertNever } from '../util/assert';
import type { ModelField, PrimitiveValueType, ValueType } from './types';

export function convertModelFieldToSchema(fieldName: string, defModelField: ModelField): schema.ModelField {
  return {
    type: convertValueTypeToSchema(defModelField.type),
    optional: !!defModelField.optional,
    docs: defModelField.docs,
    name: fieldName,
  };
}

export function convertValueTypeToSchema(defValueType: ValueType): schema.ValueType {
  if (isPrimitiveValueType(defValueType)) {
    return convertPrimitiveValueTypeToSchema(defValueType);
  }

  if (typeof defValueType === 'string') {
    return { type: 'alias', name: defValueType };
  }

  if (Array.isArray(defValueType)) {
    return {
      type: 'union',
      members: defValueType.map(convertValueTypeToSchema),
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
        values: defValueType.values.map(convertValueTypeToSchema),
      };
    case 'list':
      return {
        type: 'list',
        of: convertValueTypeToSchema(defValueType.of),
      };
    case 'map':
      return {
        type: 'map',
        fields: Object.entries(defValueType.fields).map(([fieldName, defModelField]) =>
          convertModelFieldToSchema(fieldName, defModelField)
        ),
      };
    default:
      assertNever(defValueType);
  }
}

function isPrimitiveValueType(candidate: unknown): candidate is PrimitiveValueType {
  if (typeof candidate !== 'string') {
    return false;
  }
  try {
    convertPrimitiveValueTypeToSchema(candidate as PrimitiveValueType);
    return true;
  } catch {
    return false;
  }
}

export function convertPrimitiveValueTypeToSchema(defValueType: PrimitiveValueType): schema.PrimitiveValueType {
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
