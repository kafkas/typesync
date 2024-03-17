import { python } from '../../platforms/python';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';

export function nilTypeToPython(_t: schema.types.Nil): python.None {
  return { type: 'none' };
}

export function stringTypeToPython(_t: schema.types.String): python.Str {
  return { type: 'str' };
}

export function booleanTypeToPython(_t: schema.types.Boolean): python.Bool {
  return { type: 'bool' };
}

export function integerTypeToPython(_t: schema.types.Integer): python.Int {
  return { type: 'int' };
}

export function timestampTypeToPython(_t: schema.types.Timestamp): python.Datetime {
  return { type: 'datetime' };
}

export function literalTypeToPython(t: schema.types.Literal): python.Literal {
  return { type: 'literal', value: t.value };
}

export function expressibleTupleTypeToPython(t: schema.python.ExpressibleTupleType): python.Tuple {
  return { type: 'tuple', values: t.values.map(expressibleTypeToPython) };
}

export function expressibleListTypeToPython(t: schema.python.ExpressibleListType): python.List {
  return { type: 'list', of: expressibleTypeToPython(t.of) };
}

export function expressibleUnionTypeToPython(t: schema.python.ExpressibleUnionType): python.Union {
  return { type: 'union', members: t.members.map(expressibleTypeToPython) };
}

export function expressibleAliasTypeToPython(t: schema.types.Alias): python.Alias {
  return { type: 'alias', name: t.name };
}

export function expressibleTypeToPython(t: schema.python.ExpressibleType): python.Type {
  switch (t.type) {
    case 'nil':
      return nilTypeToPython(t);
    case 'string':
      return stringTypeToPython(t);
    case 'boolean':
      return booleanTypeToPython(t);
    case 'int':
      return integerTypeToPython(t);
    case 'timestamp':
      return timestampTypeToPython(t);
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
