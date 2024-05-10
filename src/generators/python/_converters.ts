import { python } from '../../platforms/python/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';

export function unknownTypeToPython(_t: schema.python.types.Unknown): python.Any {
  return { type: 'any' };
}

export function nilTypeToPython(_t: schema.python.types.Nil): python.None {
  return { type: 'none' };
}

export function stringTypeToPython(_t: schema.python.types.String): python.Str {
  return { type: 'str' };
}

export function booleanTypeToPython(_t: schema.python.types.Boolean): python.Bool {
  return { type: 'bool' };
}

export function integerTypeToPython(_t: schema.python.types.Int): python.Int {
  return { type: 'int' };
}

export function doubleTypeToPython(_t: schema.python.types.Double): python.Float {
  return { type: 'float' };
}

export function timestampTypeToPython(_t: schema.python.types.Timestamp): python.Datetime {
  return { type: 'datetime' };
}

export function literalTypeToPython(t: schema.python.types.Literal): python.Literal {
  return { type: 'literal', value: t.value };
}

export function flatTupleTypeToPython(t: schema.python.types.Tuple): python.Tuple {
  return { type: 'tuple', elements: t.elements.map(flatTypeToPython) };
}

export function flatListTypeToPython(t: schema.python.types.List): python.List {
  return { type: 'list', elementType: flatTypeToPython(t.elementType) };
}

export function flatMapTypeToPython(t: schema.python.types.Map): python.Dict {
  return { type: 'dict', valueType: flatTypeToPython(t.valueType) };
}

export function flatDiscriminatedUnionTypeToPython(
  t: schema.python.types.DiscriminatedUnion
): python.DiscriminatedUnion {
  return { type: 'discriminated-union', discriminant: t.discriminant, variants: t.variants };
}

export function flatSimpleUnionTypeToPython(t: schema.python.types.SimpleUnion): python.SimpleUnion {
  return { type: 'simple-union', variants: t.variants.map(flatTypeToPython) };
}

export function flatAliasTypeToPython(t: schema.python.types.Alias): python.Alias {
  return { type: 'alias', name: t.name };
}

export function flatTypeToPython(t: schema.python.types.Type): python.Type {
  switch (t.type) {
    case 'unknown':
      return unknownTypeToPython(t);
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
    case 'string-literal':
    case 'int-literal':
    case 'boolean-literal':
      return literalTypeToPython(t);
    case 'tuple':
      return flatTupleTypeToPython(t);
    case 'list':
      return flatListTypeToPython(t);
    case 'map':
      return flatMapTypeToPython(t);
    case 'discriminated-union':
      return flatDiscriminatedUnionTypeToPython(t);
    case 'simple-union':
      return flatSimpleUnionTypeToPython(t);
    case 'alias':
      return flatAliasTypeToPython(t);
    default:
      assertNever(t);
  }
}
