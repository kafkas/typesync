import { swift } from '../../platforms/swift/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { FlatListType, FlatMapType, FlatTupleType, FlatType } from './_schema.js';

export function unknownTypeToSwift(_t: schema.types.Unknown): swift.Any {
  return { type: 'any' };
}

export function nilTypeToSwift(_t: schema.types.Nil): swift.Nil {
  return { type: 'nil' };
}

export function stringTypeToSwift(_t: schema.types.String): swift.String {
  return { type: 'string' };
}

export function booleanTypeToSwift(_t: schema.types.Boolean): swift.Bool {
  return { type: 'bool' };
}

export function integerTypeToSwift(_t: schema.types.Integer): swift.Int {
  return { type: 'int' };
}

export function doubleTypeToSwift(_t: schema.types.Double): swift.Double {
  return { type: 'double' };
}

export function timestampTypeToSwift(_t: schema.types.Timestamp): swift.Date {
  return { type: 'date' };
}

export function literalTypeToSwift(t: schema.types.Literal): swift.String | swift.Bool | swift.Int {
  const { value } = t;
  switch (typeof value) {
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'bool' };
    case 'number':
      return { type: 'int' };
    default:
      assertNever(value);
  }
}

export function flatTupleTypeToSwift(t: FlatTupleType): swift.Tuple {
  return { type: 'tuple', elements: t.elements.map(flatTypeToSwift) };
}

export function flatListTypeToSwift(t: FlatListType): swift.List {
  return { type: 'list', elementType: flatTypeToSwift(t.elementType) };
}

export function flatMapTypeToSwift(t: FlatMapType): swift.Dictionary {
  return { type: 'dictionary', valueType: flatTypeToSwift(t.valueType) };
}

export function flatAliasTypeToSwift(t: schema.types.Alias): swift.Alias {
  return { type: 'alias', name: t.name };
}

export function flatTypeToSwift(t: FlatType): swift.Type {
  switch (t.type) {
    case 'unknown':
      return unknownTypeToSwift(t);
    case 'nil':
      return nilTypeToSwift(t);
    case 'string':
      return stringTypeToSwift(t);
    case 'boolean':
      return booleanTypeToSwift(t);
    case 'int':
      return integerTypeToSwift(t);
    case 'double':
      return doubleTypeToSwift(t);
    case 'timestamp':
      return timestampTypeToSwift(t);
    case 'literal':
      return literalTypeToSwift(t);
    case 'tuple':
      return flatTupleTypeToSwift(t);
    case 'list':
      return flatListTypeToSwift(t);
    case 'map':
      return flatMapTypeToSwift(t);
    case 'alias':
      return flatAliasTypeToSwift(t);
    default:
      assertNever(t);
  }
}
