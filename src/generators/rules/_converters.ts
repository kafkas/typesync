import { rules } from '../../platforms/rules/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';

export function anyTypeToRules(_t: schema.rules.types.Any): rules.Any {
  return { type: 'any' };
}

export function unknownTypeToRules(_t: schema.rules.types.Unknown): rules.Any {
  return { type: 'any' };
}

export function nilTypeToRules(_t: schema.rules.types.Nil): rules.Any {
  return { type: 'any' };
}

export function stringTypeToRules(_t: schema.rules.types.String): rules.String {
  return { type: 'string' };
}

export function booleanTypeToRules(_t: schema.rules.types.Boolean): rules.Bool {
  return { type: 'bool' };
}

export function integerTypeToRules(_t: schema.rules.types.Int): rules.Int {
  return { type: 'int' };
}

export function doubleTypeToRules(_t: schema.rules.types.Double): rules.Number {
  return { type: 'number' };
}

export function timestampTypeToRules(_t: schema.rules.types.Timestamp): rules.Timestamp {
  return { type: 'timestamp' };
}

export function stringLiteralTypeToRules(t: schema.rules.types.StringLiteral): rules.Literal {
  return { type: 'literal', value: t.value };
}

export function intLiteralTypeToRules(t: schema.rules.types.IntLiteral): rules.Literal {
  return { type: 'literal', value: t.value };
}

export function booleanLiteralTypeToRules(t: schema.rules.types.BooleanLiteral): rules.Literal {
  return { type: 'literal', value: t.value };
}

export function stringEnumTypeToRules(t: schema.rules.types.Enum): rules.Enum {
  return { type: 'enum', members: t.members };
}

export function intEnumTypeToRules(t: schema.rules.types.Enum): rules.Enum {
  return { type: 'enum', members: t.members };
}

export function flatTupleTypeToRules(t: schema.rules.types.Tuple): rules.Tuple {
  return { type: 'tuple', elements: t.elements.map(flatTypeToRules) };
}

export function flatListTypeToRules(_t: schema.rules.types.List): rules.List {
  return { type: 'list' };
}

export function flatMapTypeToRules(_t: schema.rules.types.Map): rules.Map {
  return { type: 'map' };
}

export function flatObjectTypeToRules(t: schema.rules.types.Object): rules.Object {
  return {
    type: 'object',
    fields: t.fields.map(flatObjectFieldTypeToRules),
    additionalFields: t.additionalFields,
  };
}

export function flatObjectFieldTypeToRules(t: schema.rules.types.ObjectField): rules.ObjectField {
  return { type: flatTypeToRules(t.type), optional: t.optional, name: t.name };
}

export function flatDiscriminatedUnionTypeToRules(t: schema.rules.types.DiscriminatedUnion): rules.DiscriminatedUnion {
  return {
    type: 'discriminated-union',
    discriminant: t.discriminant,
    variants: t.variants.map(vt => {
      switch (vt.type) {
        case 'object':
          return flatObjectTypeToRules(vt);
        case 'alias':
          return flatAliasTypeToRules(vt);
        default:
          assertNever(vt);
      }
    }),
  };
}

export function flatSimpleUnionTypeToRules(t: schema.rules.types.SimpleUnion): rules.SimpleUnion {
  return { type: 'simple-union', variants: t.variants.map(flatTypeToRules) };
}

export function flatAliasTypeToRules(t: schema.rules.types.Alias): rules.Alias {
  return { type: 'alias', name: t.name };
}

export function flatTypeToRules(t: schema.rules.types.Type): rules.Type {
  switch (t.type) {
    case 'any':
      return anyTypeToRules(t);
    case 'unknown':
      return unknownTypeToRules(t);
    case 'nil':
      return nilTypeToRules(t);
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
    case 'string-literal':
      return stringLiteralTypeToRules(t);
    case 'int-literal':
      return intLiteralTypeToRules(t);
    case 'boolean-literal':
      return booleanLiteralTypeToRules(t);
    case 'string-enum':
      return stringEnumTypeToRules(t);
    case 'int-enum':
      return intEnumTypeToRules(t);
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
    case 'alias':
      return flatAliasTypeToRules(t);
    default:
      assertNever(t);
  }
}
