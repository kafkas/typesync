import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import {
  AliasValueType,
  BooleanValueType,
  DatetimeValueType,
  IntValueType,
  ListValueType,
  LiteralValueType,
  NoneValueType,
  StringValueType,
  TupleValueType,
  UnionValueType,
  ValueType,
} from './types';

/*
 * Converters
 */

export function fromPrimitiveValueType(vt: schema.PrimitiveValueType) {
  switch (vt.type) {
    case 'nil':
      return new NoneValueType();
    case 'string':
      return new StringValueType();
    case 'boolean':
      return new BooleanValueType();
    case 'int':
      return new IntValueType();
    case 'timestamp':
      return new DatetimeValueType();
    default:
      assertNever(vt.type);
  }
}

export function fromLiteralValueType(vt: schema.LiteralValueType): LiteralValueType {
  return new LiteralValueType(vt.value);
}

export function fromTupleValueType(vt: schema.TupleValueType): TupleValueType {
  return new TupleValueType(vt.values.map(fromExpressibleValueType));
}

export function fromListValueType(vt: schema.ListValueType): ListValueType {
  return new ListValueType(fromExpressibleValueType(vt.of));
}

export function fromUnionValueType(vt: schema.UnionValueType): UnionValueType {
  return new UnionValueType(vt.members.map(fromExpressibleValueType));
}

export function fromAliasValueType(vt: schema.AliasValueType): AliasValueType {
  return new AliasValueType(vt.name);
}

export type ExpressibleSchemaValueType = Exclude<schema.ValueType, schema.EnumValueType | schema.MapValueType>;

export function fromExpressibleValueType(vt: ExpressibleSchemaValueType): ValueType {
  if (schema.isPrimitiveValueType(vt)) {
    return fromPrimitiveValueType(vt);
  }
  switch (vt.type) {
    case 'literal':
      return fromLiteralValueType(vt);
    case 'tuple':
      return fromTupleValueType(vt);
    case 'list':
      return fromListValueType(vt);
    case 'union':
      return fromUnionValueType(vt);
    case 'alias':
      return fromAliasValueType(vt);
    default:
      assertNever(vt);
  }
}
