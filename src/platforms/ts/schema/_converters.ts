import { schema } from '../../../schema';
import { assertNever } from '../../../util/assert';
import {
  AliasType,
  BooleanType,
  EnumType,
  FieldType,
  ListType,
  LiteralType,
  MapType,
  NullType,
  NumberType,
  StringType,
  TimestampType,
  TupleType,
  Type,
  UnionType,
} from '../_types';

export function fromPrimitiveType(t: schema.types.Primitive) {
  switch (t.type) {
    case 'nil':
      return new NullType();
    case 'string':
      return new StringType();
    case 'boolean':
      return new BooleanType();
    case 'int':
      return new NumberType();
    case 'timestamp':
      return new TimestampType();
    default:
      assertNever(t.type);
  }
}

export function fromLiteralType(t: schema.types.Literal): LiteralType {
  return new LiteralType(t.value);
}

export function fromEnumType(t: schema.types.Enum): EnumType {
  return new EnumType(t.items);
}

export function fromTupleType(t: schema.types.Tuple): TupleType {
  return new TupleType(t.values.map(fromType));
}

export function fromListType(t: schema.types.List): ListType {
  return new ListType(fromType(t.of));
}

export function fromMapType(t: schema.types.Map): MapType {
  return new MapType(t.fields.map(fromFieldType));
}

export function fromFieldType(t: schema.types.Field): FieldType {
  return new FieldType(fromType(t.type), t.optional, t.name, t.docs);
}

export function fromUnionType(t: schema.types.Union): UnionType {
  return new UnionType(t.members.map(fromType));
}

export function fromAliasType(t: schema.types.Alias): AliasType {
  return new AliasType(t.name);
}

export function fromType(t: schema.types.Type): Type {
  if (schema.isPrimitiveType(t)) {
    return fromPrimitiveType(t);
  }
  switch (t.type) {
    case 'literal':
      return fromLiteralType(t);
    case 'enum':
      return fromEnumType(t);
    case 'tuple':
      return fromTupleType(t);
    case 'list':
      return fromListType(t);
    case 'map':
      return fromMapType(t);
    case 'union':
      return fromUnionType(t);
    case 'alias':
      return fromAliasType(t);
    default:
      assertNever(t);
  }
}
