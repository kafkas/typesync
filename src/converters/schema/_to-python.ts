import { python } from '../../platforms/python';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';

export function primitiveTypeToPython(t: schema.types.Primitive) {
  switch (t.type) {
    case 'nil':
      return new python.NoneType();
    case 'string':
      return new python.StringType();
    case 'boolean':
      return new python.BooleanType();
    case 'int':
      return new python.IntType();
    case 'timestamp':
      return new python.DatetimeType();
    default:
      assertNever(t.type);
  }
}

export function literalTypeToPython(t: schema.types.Literal) {
  return new python.LiteralType(t.value);
}

export function expressibleTupleTypeToPython(t: schema.python.ExpressibleTupleType) {
  return new python.TupleType(t.values.map(expressibleTypeToPython));
}

export function expressibleListTypeToPython(t: schema.python.ExpressibleListType) {
  return new python.ListType(expressibleTypeToPython(t.of));
}

export function expressibleUnionTypeToPython(t: schema.python.ExpressibleUnionType) {
  return new python.UnionType(t.members.map(expressibleTypeToPython));
}

export function expressibleAliasTypeToPython(t: schema.types.Alias) {
  return new python.AliasType(t.name);
}

export function expressibleTypeToPython(t: schema.python.ExpressibleType): python.Type {
  if (schema.isPrimitiveType(t)) {
    return primitiveTypeToPython(t);
  }
  switch (t.type) {
    case 'literal':
      return literalTypeToPython(t);
    case 'tuple':
      return expressibleTupleTypeToPython(t);
    case 'list':
      return expressibleListTypeToPython(t);
    case 'union':
      return expressibleUnionTypeToPython(t);
    case 'alias':
      return expressibleAliasTypeToPython(t);
    default:
      assertNever(t);
  }
}
