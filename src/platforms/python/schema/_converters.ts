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

export function fromPrimitiveType(vt: schema.types.Primitive) {
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

export function fromLiteralType(vt: schema.types.Literal): LiteralType {
  return new LiteralType(vt.value);
}

export function fromExpressibleTupleType(vt: ExpressibleTupleType): TupleType {
  return new TupleType(vt.values.map(fromExpressibleType));
}

export function fromExpressibleListType(vt: ExpressibleListType): ListType {
  return new ListType(fromExpressibleType(vt.of));
}

export function fromExpressibleUnionType(vt: ExpressibleUnionType): UnionType {
  return new UnionType(vt.members.map(fromExpressibleType));
}

export function fromExpressibleAliasType(vt: schema.types.Alias): AliasType {
  return new AliasType(vt.name);
}

export function fromExpressibleType(vt: ExpressibleType): Type {
  if (schema.isPrimitiveType(vt)) {
    return fromPrimitiveType(vt);
  }
  switch (vt.type) {
    case 'literal':
      return fromLiteralType(vt);
    case 'tuple':
      return fromExpressibleTupleType(vt);
    case 'list':
      return fromExpressibleListType(vt);
    case 'union':
      return fromExpressibleUnionType(vt);
    case 'alias':
      return fromExpressibleAliasType(vt);
    default:
      assertNever(vt);
  }
}
