import { rules } from '../../platforms/rules/index.js';
import { assertNever } from '../../util/assert.js';

export function unknownTypeToRules(_t: rules.schema.types.Unknown): rules.Any {
  return { type: 'any' };
}

export function nilTypeToRules(_t: rules.schema.types.Nil): rules.Any {
  return { type: 'any' };
}

export function stringTypeToRules(_t: rules.schema.types.String): rules.String {
  return { type: 'string' };
}

export function booleanTypeToRules(_t: rules.schema.types.Boolean): rules.Bool {
  return { type: 'bool' };
}

export function integerTypeToRules(_t: rules.schema.types.Int): rules.Int {
  return { type: 'int' };
}

export function doubleTypeToRules(_t: rules.schema.types.Double): rules.Float {
  return { type: 'float' };
}

export function timestampTypeToRules(_t: rules.schema.types.Timestamp): rules.Timestamp {
  return { type: 'timestamp' };
}

export function stringLiteralTypeToRules(t: rules.schema.types.StringLiteral): rules.Literal {
  return { type: 'literal', value: t.value };
}

export function intLiteralTypeToRules(t: rules.schema.types.IntLiteral): rules.Literal {
  return { type: 'literal', value: t.value };
}

export function booleanLiteralTypeToRules(t: rules.schema.types.BooleanLiteral): rules.Literal {
  return { type: 'literal', value: t.value };
}

export function stringEnumTypeToRules(t: rules.schema.types.Enum): rules.Enum {
  return { type: 'enum', members: t.members };
}

export function intEnumTypeToRules(t: rules.schema.types.Enum): rules.Enum {
  return { type: 'enum', members: t.members };
}

export function flatTupleTypeToRules(t: rules.schema.types.Tuple): rules.Tuple {
  return { type: 'tuple', elements: t.elements.map(flatTypeToRules) };
}

export function flatListTypeToRules(_t: rules.schema.types.List): rules.List {
  return { type: 'list' };
}

export function flatMapTypeToRules(_t: rules.schema.types.Map): rules.Map {
  return { type: 'map' };
}

export function flatObjectTypeToRules(t: rules.schema.types.Object): rules.Object {
  return {
    type: 'object',
    fields: t.fields.map(flatObjectFieldTypeToRules),
    additionalFields: t.additionalFields,
  };
}

export function flatObjectFieldTypeToRules(t: rules.schema.types.ObjectField): rules.ObjectField {
  return { type: flatTypeToRules(t.type), optional: t.optional, name: t.name };
}

export function flatDiscriminatedUnionTypeToRules(t: rules.schema.types.DiscriminatedUnion): rules.DiscriminatedUnion {
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

export function flatSimpleUnionTypeToRules(t: rules.schema.types.SimpleUnion): rules.SimpleUnion {
  return { type: 'simple-union', variants: t.variants.map(flatTypeToRules) };
}

export function flatAliasTypeToRules(t: rules.schema.types.Alias): rules.Alias {
  return { type: 'alias', name: t.name };
}

export function flatTypeToRules(t: rules.schema.types.Type): rules.Type {
  switch (t.type) {
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
