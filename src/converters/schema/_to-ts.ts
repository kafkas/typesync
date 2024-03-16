import { ts } from '../../platforms/ts';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';

export function primitiveTypeToTS(t: schema.types.Primitive) {
  switch (t.type) {
    case 'nil':
      return new ts.NullType();
    case 'string':
      return new ts.StringType();
    case 'boolean':
      return new ts.BooleanType();
    case 'int':
      return new ts.NumberType();
    case 'timestamp':
      return new ts.TimestampType();
    default:
      assertNever(t.type);
  }
}

export function literalTypeToTS(t: schema.types.Literal) {
  return new ts.LiteralType(t.value);
}

export function enumTypeToTS(t: schema.types.Enum) {
  return new ts.EnumType(t.items);
}

export function tupleTypeToTS(t: schema.types.Tuple) {
  return new ts.TupleType(t.values.map(typeToTS));
}

export function listTypeToTS(t: schema.types.List) {
  return new ts.ListType(typeToTS(t.of));
}

export function objectTypeToTS(t: schema.types.Object) {
  return new ts.ObjectType(t.fields.map(fieldTypeToTS));
}

export function fieldTypeToTS(t: schema.types.Field) {
  return new ts.FieldType(typeToTS(t.type), t.optional, t.name, t.docs);
}

export function unionTypeToTS(t: schema.types.Union) {
  return new ts.UnionType(t.members.map(typeToTS));
}

export function aliasTypeToTS(t: schema.types.Alias) {
  return new ts.AliasType(t.name);
}

export function typeToTS(t: schema.types.Type): ts.Type {
  if (schema.isPrimitiveType(t)) {
    return primitiveTypeToTS(t);
  }
  switch (t.type) {
    case 'literal':
      return literalTypeToTS(t);
    case 'enum':
      return enumTypeToTS(t);
    case 'tuple':
      return tupleTypeToTS(t);
    case 'list':
      return listTypeToTS(t);
    case 'object':
      return objectTypeToTS(t);
    case 'union':
      return unionTypeToTS(t);
    case 'alias':
      return aliasTypeToTS(t);
    default:
      assertNever(t);
  }
}
