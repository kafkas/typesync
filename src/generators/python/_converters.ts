import { python } from '../../platforms/python/index.js';
import { assertNever } from '../../util/assert.js';

export function unknownTypeToPython(_t: python.schema.types.Unknown): python.Any {
  return { type: 'any' };
}

export function nilTypeToPython(_t: python.schema.types.Nil): python.None {
  return { type: 'none' };
}

export function stringTypeToPython(_t: python.schema.types.String): python.Str {
  return { type: 'str' };
}

export function booleanTypeToPython(_t: python.schema.types.Boolean): python.Bool {
  return { type: 'bool' };
}

export function integerTypeToPython(_t: python.schema.types.Int): python.Int {
  return { type: 'int' };
}

export function doubleTypeToPython(_t: python.schema.types.Double): python.Float {
  return { type: 'float' };
}

export function timestampTypeToPython(_t: python.schema.types.Timestamp): python.Datetime {
  return { type: 'datetime' };
}

export function literalTypeToPython(t: python.schema.types.Literal): python.Literal {
  return { type: 'literal', value: t.value };
}

export function flatTupleTypeToPython(t: python.schema.types.Tuple): python.Tuple {
  return { type: 'tuple', elements: t.elements.map(flatTypeToPython) };
}

export function flatListTypeToPython(t: python.schema.types.List): python.List {
  return { type: 'list', elementType: flatTypeToPython(t.elementType) };
}

export function flatMapTypeToPython(t: python.schema.types.Map): python.Dict {
  return { type: 'dict', valueType: flatTypeToPython(t.valueType) };
}

export function flatDiscriminatedUnionTypeToPython(
  t: python.schema.types.DiscriminatedUnion
): python.DiscriminatedUnion {
  return { type: 'discriminated-union', discriminant: t.discriminant, variants: t.variants };
}

export function flatSimpleUnionTypeToPython(t: python.schema.types.SimpleUnion): python.SimpleUnion {
  return { type: 'simple-union', variants: t.variants.map(flatTypeToPython) };
}

export function flatAliasTypeToPython(t: python.schema.types.Alias): python.Alias {
  return { type: 'alias', name: t.name };
}

export function flatTypeToPython(t: python.schema.types.Type): python.Type {
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
