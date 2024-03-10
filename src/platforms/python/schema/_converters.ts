import { schema } from '../../../schema';
import { assertNever } from '../../../util/assert';
import {
  AliasType,
  BooleanType,
  DatetimeType,
  IntType,
  ListType,
  LiteralType,
  NoneType,
  StringType,
  TupleType,
  Type,
  UnionType,
} from '../_types';
import { ExpressibleListType, ExpressibleTupleType, ExpressibleType, ExpressibleUnionType } from './_expressibles';

export function fromPrimitiveType(t: schema.types.Primitive) {
  switch (t.type) {
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
      assertNever(t.type);
  }
}

export function fromLiteralType(t: schema.types.Literal): LiteralType {
  return new LiteralType(t.value);
}

export function fromExpressibleTupleType(t: ExpressibleTupleType): TupleType {
  return new TupleType(t.values.map(fromExpressibleType));
}

export function fromExpressibleListType(t: ExpressibleListType): ListType {
  return new ListType(fromExpressibleType(t.of));
}

export function fromExpressibleUnionType(t: ExpressibleUnionType): UnionType {
  return new UnionType(t.members.map(fromExpressibleType));
}

export function fromExpressibleAliasType(t: schema.types.Alias): AliasType {
  return new AliasType(t.name);
}

export function fromExpressibleType(t: ExpressibleType): Type {
  if (schema.isPrimitiveType(t)) {
    return fromPrimitiveType(t);
  }
  switch (t.type) {
    case 'literal':
      return fromLiteralType(t);
    case 'tuple':
      return fromExpressibleTupleType(t);
    case 'list':
      return fromExpressibleListType(t);
    case 'union':
      return fromExpressibleUnionType(t);
    case 'alias':
      return fromExpressibleAliasType(t);
    default:
      assertNever(t);
  }
}
