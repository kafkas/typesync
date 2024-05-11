import { ts } from '../../platforms/ts/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';

export function anyTypeToTS(_t: schema.ts.types.Any): ts.Any {
  return { type: 'any' };
}

export function unknownTypeToTS(_t: schema.ts.types.Unknown): ts.Unknown {
  return { type: 'unknown' };
}

export function nilTypeToTS(_t: schema.ts.types.Nil): ts.Null {
  return { type: 'null' };
}

export function stringTypeToTS(_t: schema.ts.types.String): ts.String {
  return { type: 'string' };
}

export function booleanTypeToTS(_t: schema.ts.types.Boolean): ts.Boolean {
  return { type: 'boolean' };
}

export function integerTypeToTS(_t: schema.ts.types.Int): ts.Number {
  return { type: 'number' };
}

export function doubleTypeToTS(_t: schema.ts.types.Double): ts.Number {
  return { type: 'number' };
}

export function timestampTypeToTS(_t: schema.ts.types.Timestamp): ts.Timestamp {
  return { type: 'timestamp' };
}

export function stringLiteralTypeToTS(t: schema.ts.types.StringLiteral): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function intLiteralTypeToTS(t: schema.ts.types.IntLiteral): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function booleanLiteralTypeToTS(t: schema.ts.types.BooleanLiteral): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function stringEnumTypeToTS(t: schema.ts.types.StringEnum): ts.Enum {
  return { type: 'enum', members: t.members };
}

export function intEnumTypeToTS(t: schema.ts.types.IntEnum): ts.Enum {
  return { type: 'enum', members: t.members };
}

export function tupleTypeToTS(t: schema.ts.types.Tuple): ts.Tuple {
  return { type: 'tuple', elements: t.elements.map(typeToTS) };
}

export function listTypeToTS(t: schema.ts.types.List): ts.List {
  return { type: 'list', elementType: typeToTS(t.elementType) };
}

export function mapTypeToTS(t: schema.ts.types.Map): ts.Record {
  return { type: 'record', valueType: typeToTS(t.valueType) };
}

export function objectTypeToTS(t: schema.ts.types.Object): ts.Object {
  return {
    type: 'object',
    properties: t.fields.map(objectFieldTypeToTS),
    additionalProperties: t.additionalFields,
  };
}

export function objectFieldTypeToTS(t: schema.ts.types.ObjectField): ts.ObjectProperty {
  return { type: typeToTS(t.type), optional: t.optional, name: t.name, docs: t.docs };
}

export function unionTypeToTS(t: schema.ts.types.Union): ts.Union {
  return { type: 'union', variants: t.variants.map(typeToTS) };
}

export function aliasTypeToTS(t: schema.ts.types.Alias): ts.Alias {
  return { type: 'alias', name: t.name };
}

export function typeToTS(t: schema.ts.types.Type): ts.Type {
  switch (t.type) {
    case 'any':
      return anyTypeToTS(t);
    case 'unknown':
      return unknownTypeToTS(t);
    case 'nil':
      return nilTypeToTS(t);
    case 'string':
      return stringTypeToTS(t);
    case 'boolean':
      return booleanTypeToTS(t);
    case 'int':
      return integerTypeToTS(t);
    case 'double':
      return doubleTypeToTS(t);
    case 'timestamp':
      return timestampTypeToTS(t);
    case 'string-literal':
      return stringLiteralTypeToTS(t);
    case 'int-literal':
      return intLiteralTypeToTS(t);
    case 'boolean-literal':
      return booleanLiteralTypeToTS(t);
    case 'string-enum':
      return stringEnumTypeToTS(t);
    case 'int-enum':
      return intEnumTypeToTS(t);
    case 'tuple':
      return tupleTypeToTS(t);
    case 'list':
      return listTypeToTS(t);
    case 'map':
      return mapTypeToTS(t);
    case 'object':
      return objectTypeToTS(t);
    case 'discriminated-union':
      return unionTypeToTS(t);
    case 'simple-union':
      return unionTypeToTS(t);
    case 'alias':
      return aliasTypeToTS(t);
    default:
      assertNever(t);
  }
}
