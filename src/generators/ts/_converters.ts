import { ts } from '../../platforms/ts/index.js';
import { assertNever } from '../../util/assert.js';

export function unknownTypeToTS(_t: ts.schema.types.Unknown): ts.Unknown {
  return { type: 'unknown' };
}

export function nilTypeToTS(_t: ts.schema.types.Nil): ts.Null {
  return { type: 'null' };
}

export function stringTypeToTS(_t: ts.schema.types.String): ts.String {
  return { type: 'string' };
}

export function booleanTypeToTS(_t: ts.schema.types.Boolean): ts.Boolean {
  return { type: 'boolean' };
}

export function integerTypeToTS(_t: ts.schema.types.Int): ts.Number {
  return { type: 'number' };
}

export function doubleTypeToTS(_t: ts.schema.types.Double): ts.Number {
  return { type: 'number' };
}

export function timestampTypeToTS(_t: ts.schema.types.Timestamp): ts.Timestamp {
  return { type: 'timestamp' };
}

export function stringLiteralTypeToTS(t: ts.schema.types.StringLiteral): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function intLiteralTypeToTS(t: ts.schema.types.IntLiteral): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function booleanLiteralTypeToTS(t: ts.schema.types.BooleanLiteral): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function stringEnumTypeToTS(t: ts.schema.types.StringEnum): ts.Enum {
  return { type: 'enum', members: t.members };
}

export function intEnumTypeToTS(t: ts.schema.types.IntEnum): ts.Enum {
  return { type: 'enum', members: t.members };
}

export function tupleTypeToTS(t: ts.schema.types.Tuple): ts.Tuple {
  return { type: 'tuple', elements: t.elements.map(typeToTS) };
}

export function listTypeToTS(t: ts.schema.types.List): ts.List {
  return { type: 'list', elementType: typeToTS(t.elementType) };
}

export function mapTypeToTS(t: ts.schema.types.Map): ts.Record {
  return { type: 'record', valueType: typeToTS(t.valueType) };
}

export function objectTypeToTS(t: ts.schema.types.Object): ts.Object {
  return {
    type: 'object',
    properties: t.fields.map(objectFieldTypeToTS),
    additionalProperties: t.additionalFields,
  };
}

export function objectFieldTypeToTS(t: ts.schema.types.ObjectField): ts.ObjectProperty {
  return { type: typeToTS(t.type), optional: t.optional, name: t.name, docs: t.docs };
}

export function unionTypeToTS(t: ts.schema.types.Union): ts.Union {
  return { type: 'union', variants: t.variants.map(typeToTS) };
}

export function aliasTypeToTS(t: ts.schema.types.Alias): ts.Alias {
  return { type: 'alias', name: t.name };
}

export function typeToTS(t: ts.schema.types.Type): ts.Type {
  switch (t.type) {
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
