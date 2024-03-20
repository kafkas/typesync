import { python } from '../../platforms/python';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import { FlatListType, FlatMapType, FlatTupleType, FlatType, FlatUnionType } from './_schema';

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

export function doubleTypeToPython(_t: schema.types.Double): python.Float {
  return { type: 'float' };
}

export function timestampTypeToPython(_t: schema.types.Timestamp): python.Datetime {
  return { type: 'datetime' };
}

export function literalTypeToPython(t: schema.types.Literal): python.Literal {
  return { type: 'literal', value: t.value };
}

export function flatTupleTypeToPython(t: FlatTupleType): python.Tuple {
  return { type: 'tuple', values: t.values.map(flatTypeToPython) };
}

export function flatListTypeToPython(t: FlatListType): python.List {
  return { type: 'list', of: flatTypeToPython(t.of) };
}

export function flatMapTypeToPython(t: FlatMapType): python.Dict {
  return { type: 'dict', of: flatTypeToPython(t.of) };
}

export function flatUnionTypeToPython(t: FlatUnionType): python.Union {
  return { type: 'union', members: t.members.map(flatTypeToPython) };
}

export function flatAliasTypeToPython(t: schema.types.Alias): python.Alias {
  return { type: 'alias', name: t.name };
}

export function flatTypeToPython(t: FlatType): python.Type {
  switch (t.type) {
    case 'nil':
      return nilTypeToPython(t);
    case 'string':
      return stringTypeToPython(t);
    case 'boolean':
      return booleanTypeToPython(t);
    case 'int':
      return integerTypeToPython(t);
    case 'double':
      return doubleTypeToPython(t);
    case 'timestamp':
      return timestampTypeToPython(t);
    case 'literal':
      return literalTypeToPython(t);
    case 'tuple':
      return flatTupleTypeToPython(t);
    case 'list':
      return flatListTypeToPython(t);
    case 'map':
      return flatMapTypeToPython(t);
    case 'union':
      return flatUnionTypeToPython(t);
    case 'alias':
      return flatAliasTypeToPython(t);
    default:
      assertNever(t);
  }
}
