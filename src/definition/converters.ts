import type { schema } from '../schema';
import { assertNever } from '../util/assert';
import type {
  EnumValueType,
  ListValueType,
  LiteralValueType,
  MapValueType,
  ModelField,
  PrimitiveValueType,
  TupleValueType,
  ValueType,
} from './types';

const PRIMITIVE_VALUE_MAPPING: Record<PrimitiveValueType, schema.types.Primitive> = {
  nil: { type: 'nil' },
  string: { type: 'string' },
  boolean: { type: 'boolean' },
  int: { type: 'int' },
  timestamp: { type: 'timestamp' },
};

/*
 * Type Guards
 */

export function isPrimitiveValueType(candidate: unknown): candidate is PrimitiveValueType {
  if (typeof candidate !== 'string') return false;
  return PRIMITIVE_VALUE_MAPPING[candidate as PrimitiveValueType] !== undefined;
}

/*
 * Converters
 */

export function convertPrimitiveValueTypeToSchema(vt: PrimitiveValueType): schema.types.Primitive {
  return PRIMITIVE_VALUE_MAPPING[vt];
}

export function convertLiteralValueTypeToSchema(vt: LiteralValueType): schema.types.Literal {
  return {
    type: 'literal',
    value: vt.value,
  };
}

export function convertEnumValueTypeToSchema(vt: EnumValueType): schema.types.Enum {
  return {
    type: 'enum',
    items: vt.items,
  };
}

export function convertTupleValueTypeToSchema(vt: TupleValueType): schema.types.Tuple {
  return {
    type: 'tuple',
    values: vt.values.map(convertValueTypeToSchema),
  };
}

export function convertListValueTypeToSchema(vt: ListValueType): schema.types.List {
  return {
    type: 'list',
    of: convertValueTypeToSchema(vt.of),
  };
}

export function convertMapValueTypeToSchema(vt: MapValueType): schema.types.Map {
  return {
    type: 'map',
    fields: Object.entries(vt.fields).map(([fieldName, field]) => convertModelFieldToSchema(fieldName, field)),
  };
}

function convertModelFieldToSchema(fieldName: string, field: ModelField): schema.types.Field {
  return {
    type: convertValueTypeToSchema(field.type),
    optional: !!field.optional,
    docs: field.docs,
    name: fieldName,
  };
}

export function convertValueTypeToSchema(vt: ValueType): schema.types.Type {
  if (isPrimitiveValueType(vt)) {
    return convertPrimitiveValueTypeToSchema(vt);
  }

  if (typeof vt === 'string') {
    return { type: 'alias', name: vt };
  }

  if (Array.isArray(vt)) {
    return {
      type: 'union',
      members: vt.map(convertValueTypeToSchema),
    };
  }

  switch (vt.type) {
    case 'literal':
      return convertLiteralValueTypeToSchema(vt);
    case 'enum':
      return convertEnumValueTypeToSchema(vt);
    case 'tuple':
      return convertTupleValueTypeToSchema(vt);
    case 'list':
      return convertListValueTypeToSchema(vt);
    case 'map':
      return convertMapValueTypeToSchema(vt);
    default:
      assertNever(vt);
  }
}
