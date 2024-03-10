import type { schema } from '../schema';
import { assertNever } from '../util/assert';
import type { types } from './types';

const PRIMITIVE_VALUE_MAPPING: Record<types.Primitive, schema.types.Primitive> = {
  nil: { type: 'nil' },
  string: { type: 'string' },
  boolean: { type: 'boolean' },
  int: { type: 'int' },
  timestamp: { type: 'timestamp' },
};

/*
 * Type Guards
 */

export function isPrimitiveType(candidate: unknown): candidate is types.Primitive {
  if (typeof candidate !== 'string') return false;
  return PRIMITIVE_VALUE_MAPPING[candidate as types.Primitive] !== undefined;
}

/*
 * Converters
 */

export function convertPrimitiveTypeToSchema(vt: types.Primitive): schema.types.Primitive {
  return PRIMITIVE_VALUE_MAPPING[vt];
}

export function convertLiteralTypeToSchema(vt: types.Literal): schema.types.Literal {
  return {
    type: 'literal',
    value: vt.value,
  };
}

export function convertEnumTypeToSchema(vt: types.Enum): schema.types.Enum {
  return {
    type: 'enum',
    items: vt.items,
  };
}

export function convertTupleTypeToSchema(vt: types.Tuple): schema.types.Tuple {
  return {
    type: 'tuple',
    values: vt.values.map(convertTypeToSchema),
  };
}

export function convertListTypeToSchema(vt: types.List): schema.types.List {
  return {
    type: 'list',
    of: convertTypeToSchema(vt.of),
  };
}

export function convertMapTypeToSchema(vt: types.Map): schema.types.Map {
  return {
    type: 'map',
    fields: Object.entries(vt.fields).map(([fieldName, field]) => convertFieldToSchema(fieldName, field)),
  };
}

function convertFieldToSchema(fieldName: string, field: types.Field): schema.types.Field {
  return {
    type: convertTypeToSchema(field.type),
    optional: !!field.optional,
    docs: field.docs,
    name: fieldName,
  };
}

export function convertTypeToSchema(vt: types.Type): schema.types.Type {
  if (isPrimitiveType(vt)) {
    return convertPrimitiveTypeToSchema(vt);
  }

  if (typeof vt === 'string') {
    return { type: 'alias', name: vt };
  }

  if (Array.isArray(vt)) {
    return {
      type: 'union',
      members: vt.map(convertTypeToSchema),
    };
  }

  switch (vt.type) {
    case 'literal':
      return convertLiteralTypeToSchema(vt);
    case 'enum':
      return convertEnumTypeToSchema(vt);
    case 'tuple':
      return convertTupleTypeToSchema(vt);
    case 'list':
      return convertListTypeToSchema(vt);
    case 'map':
      return convertMapTypeToSchema(vt);
    default:
      assertNever(vt);
  }
}
