import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import {
  AliasValueType,
  BooleanType,
  DatetimeType,
  EnumValueType,
  IntType,
  ListValueType,
  LiteralValueType,
  MapValueType,
  ModelField,
  NoneType,
  PrimitiveValueType,
  StringType,
  TupleValueType,
  UnionValueType,
  ValueType,
} from './types';

/*
 * Converters
 */

export function fromPrimitiveValueType(vt: schema.PrimitiveValueType): PrimitiveValueType {
  switch (vt.type) {
    case 'nil':
      return new NoneType();
    case 'string':
      return new StringType();
    case 'boolean':
      return new BooleanType();
    case 'int':
      return new IntType();
    case 'timestamp':
      return new DatetimeType();
    default:
      assertNever(vt.type);
  }
}

export function fromLiteralValueType(vt: schema.LiteralValueType): LiteralValueType {
  return new LiteralValueType(vt.value);
}

export function fromEnumValueType(vt: schema.EnumValueType): EnumValueType {
  // TODO: Implement
  const name = 'Placeholder';
  return new EnumValueType(name, vt.items);
}

export function fromTupleValueType(vt: schema.TupleValueType): TupleValueType {
  return new TupleValueType(vt.values.map(fromValueType));
}

export function fromListValueType(vt: schema.ListValueType): ListValueType {
  return new ListValueType(fromValueType(vt.of));
}

export function fromMapValueType(vt: schema.MapValueType): MapValueType {
  return new MapValueType(vt.fields.map(fromModelField));
}

function fromModelField(field: schema.ModelField): ModelField {
  return { ...field, type: fromValueType(field.type) };
}

export function fromUnionValueType(vt: schema.UnionValueType): UnionValueType {
  return new UnionValueType(vt.members.map(fromValueType));
}

export function fromAliasValueType(vt: schema.AliasValueType): AliasValueType {
  return new AliasValueType(vt.name);
}

export function fromValueType(vt: schema.ValueType): ValueType {
  if (schema.isPrimitiveValueType(vt)) {
    return fromPrimitiveValueType(vt);
  }
  switch (vt.type) {
    case 'literal':
      return fromLiteralValueType(vt);
    case 'enum':
      return fromEnumValueType(vt);
    case 'tuple':
      return fromTupleValueType(vt);
    case 'list':
      return fromListValueType(vt);
    case 'map':
      return fromMapValueType(vt);
    case 'union':
      return fromUnionValueType(vt);
    case 'alias':
      return fromAliasValueType(vt);
    default:
      assertNever(vt);
  }
}
