import { rules } from '../../platforms/rules/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import type {
  FlatDiscriminatedUnionType,
  FlatListType,
  FlatObjectFieldType,
  FlatObjectType,
  FlatSimpleUnionType,
  FlatTupleType,
  FlatType,
} from './_schema.js';

export function unknownTypeToRules(_t: schema.types.Unknown): rules.Any {
  return { type: 'any' };
}

export function stringTypeToRules(_t: schema.types.String): rules.String {
  return { type: 'string' };
}

export function booleanTypeToRules(_t: schema.types.Boolean): rules.Bool {
  return { type: 'bool' };
}

export function integerTypeToRules(_t: schema.types.Integer): rules.Int {
  return { type: 'int' };
}

export function doubleTypeToRules(_t: schema.types.Double): rules.Float {
  return { type: 'float' };
}

export function timestampTypeToRules(_t: schema.types.Timestamp): rules.Timestamp {
  return { type: 'timestamp' };
}

export function literalTypeToRules(t: schema.types.Literal): rules.Literal {
  return { type: 'literal', value: t.value };
}

export function enumTypeToRules(t: schema.types.Enum): rules.Enum {
  return { type: 'enum', members: t.members };
}

export function flatTupleTypeToRules(t: FlatTupleType): rules.Tuple {
  return { type: 'tuple', elements: t.elements.map(flatTypeToRules) };
}

export function flatListTypeToRules(_t: FlatListType): rules.List {
  return { type: 'list' };
}

export function flatMapTypeToRules(_t: schema.types.Map): rules.Map {
  return { type: 'map' };
}

export function flatObjectTypeToRules(t: FlatObjectType): rules.Object {
  return {
    type: 'object',
    fields: t.fields.map(flatObjectFieldTypeToRules),
    additionalFields: t.additionalFields,
  };
}

export function flatObjectFieldTypeToRules(t: FlatObjectFieldType): rules.ObjectField {
  return { type: flatTypeToRules(t.type), optional: t.optional, name: t.name };
}

export function flatDiscriminatedUnionTypeToRules(t: FlatDiscriminatedUnionType): rules.DiscriminatedUnion {
  return { type: 'discriminated-union', discriminant: t.discriminant, variants: t.variants.map(flatObjectTypeToRules) };
}

export function flatSimpleUnionTypeToRules(t: FlatSimpleUnionType): rules.SimpleUnion {
  return { type: 'simple-union', variants: t.variants.map(flatTypeToRules) };
}

export function flatTypeToRules(t: FlatType): rules.Type {
  switch (t.type) {
    case 'unknown':
      return unknownTypeToRules(t);
    case 'string':
      return stringTypeToRules(t);
    case 'boolean':
      return booleanTypeToRules(t);
    case 'int':
      return integerTypeToRules(t);
    case 'double':
      return doubleTypeToRules(t);
    case 'timestamp':
      return timestampTypeToRules(t);
    case 'literal':
      return literalTypeToRules(t);
    case 'enum':
      return enumTypeToRules(t);
    case 'tuple':
      return flatTupleTypeToRules(t);
    case 'list':
      return flatListTypeToRules(t);
    case 'map':
      return flatMapTypeToRules(t);
    case 'object':
      return flatObjectTypeToRules(t);
    case 'discriminated-union':
      return flatDiscriminatedUnionTypeToRules(t);
    case 'simple-union':
      return flatSimpleUnionTypeToRules(t);
    default:
      assertNever(t);
  }
}
