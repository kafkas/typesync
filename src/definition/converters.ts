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

const PRIMITIVE_VALUE_MAPPING: Record<PrimitiveValueType, schema.PrimitiveValueType> = {
  nil: { type: 'nil' },
  string: { type: 'nil' },
  boolean: { type: 'nil' },
  int: { type: 'nil' },
  timestamp: { type: 'nil' },
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

export function convertPrimitiveValueTypeToSchema(vt: PrimitiveValueType): schema.PrimitiveValueType {
  return PRIMITIVE_VALUE_MAPPING[vt];
}

export function convertLiteralValueTypeToSchema(vt: LiteralValueType): schema.LiteralValueType {
  return {
    type: 'literal',
    value: vt.value,
  };
}

export function convertEnumValueTypeToSchema(vt: EnumValueType): schema.EnumValueType {
  return {
    type: 'enum',
    items: vt.items,
  };
}

export function convertTupleValueTypeToSchema(vt: TupleValueType): schema.TupleValueType {
  return {
    type: 'tuple',
    values: vt.values.map(convertValueTypeToSchema),
  };
}

export function convertListValueTypeToSchema(vt: ListValueType): schema.ListValueType {
  return {
    type: 'list',
    of: convertValueTypeToSchema(vt.of),
  };
}

export function convertMapValueTypeToSchema(vt: MapValueType): schema.MapValueType {
  return {
    type: 'map',
    fields: Object.entries(vt.fields).map(([fieldName, field]) => convertModelFieldToSchema(fieldName, field)),
  };
}

function convertModelFieldToSchema(fieldName: string, field: ModelField): schema.ModelField {
  return {
    type: convertValueTypeToSchema(field.type),
    optional: !!field.optional,
    docs: field.docs,
    name: fieldName,
  };
}

export function convertValueTypeToSchema(vt: ValueType): schema.ValueType {
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
