import type { schema } from '../schema';
import { assertNever } from '../util/assert';
import { isPrimitiveType } from './guards';
import type { types } from './types';

export function convertPrimitiveTypeToSchema(vt: types.Primitive): schema.types.Primitive {
  switch (vt) {
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
      assertNever(vt);
  }
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
