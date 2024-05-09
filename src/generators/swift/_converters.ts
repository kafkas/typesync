import { swift } from '../../platforms/swift/index.js';
import { assertNever } from '../../util/assert.js';

export function unknownTypeToSwift(_t: swift.schema.types.Unknown): swift.Any {
  return { type: 'any' };
}

export function nilTypeToSwift(_t: swift.schema.types.Nil): swift.Nil {
  return { type: 'nil' };
}

export function stringTypeToSwift(_t: swift.schema.types.String): swift.String {
  return { type: 'string' };
}

export function booleanTypeToSwift(_t: swift.schema.types.Boolean): swift.Bool {
  return { type: 'bool' };
}

export function integerTypeToSwift(_t: swift.schema.types.Int): swift.Int {
  return { type: 'int' };
}

export function doubleTypeToSwift(_t: swift.schema.types.Double): swift.Double {
  return { type: 'double' };
}

export function timestampTypeToSwift(_t: swift.schema.types.Timestamp): swift.Date {
  return { type: 'date' };
}

export function stringLiteralTypeToSwift(_t: swift.schema.types.StringLiteral): swift.String {
  return { type: 'string' };
}

export function intLiteralTypeToSwift(_t: swift.schema.types.IntLiteral): swift.Int {
  return { type: 'int' };
}

export function booleanLiteralTypeToSwift(_t: swift.schema.types.BooleanLiteral): swift.Bool {
  return { type: 'bool' };
}

export function literalTypeToSwift(t: swift.schema.types.Literal): swift.String | swift.Bool | swift.Int {
  switch (t.type) {
    case 'string-literal':
      return stringLiteralTypeToSwift(t);
    case 'int-literal':
      return intLiteralTypeToSwift(t);
    case 'boolean-literal':
      return booleanLiteralTypeToSwift(t);
    default:
      assertNever(t);
  }
}

export function flatTupleTypeToSwift(t: swift.schema.types.Tuple): swift.Tuple {
  return { type: 'tuple', elements: t.elements.map(flatTypeToSwift) };
}

export function flatListTypeToSwift(t: swift.schema.types.List): swift.List {
  return { type: 'list', elementType: flatTypeToSwift(t.elementType) };
}

export function flatMapTypeToSwift(t: swift.schema.types.Map): swift.Dictionary {
  return { type: 'dictionary', valueType: flatTypeToSwift(t.valueType) };
}

export function flatAliasTypeToSwift(t: swift.schema.types.Alias): swift.Alias {
  return { type: 'alias', name: t.name };
}

export function flatTypeToSwift(t: swift.schema.types.Type): swift.Type {
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
    case 'string-literal':
      return stringLiteralTypeToSwift(t);
    case 'int-literal':
      return intLiteralTypeToSwift(t);
    case 'boolean-literal':
      return booleanLiteralTypeToSwift(t);
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
