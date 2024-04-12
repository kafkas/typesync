import { ts } from '../../platforms/ts/index.js';
import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';

export function nilTypeToTS(_t: schema.types.Nil): ts.Null {
  return { type: 'null' };
}

export function stringTypeToTS(_t: schema.types.String): ts.String {
  return { type: 'string' };
}

export function booleanTypeToTS(_t: schema.types.Boolean): ts.Boolean {
  return { type: 'boolean' };
}

export function integerTypeToTS(_t: schema.types.Integer): ts.Number {
  return { type: 'number' };
}

export function doubleTypeToTS(_t: schema.types.Double): ts.Number {
  return { type: 'number' };
}

export function timestampTypeToTS(_t: schema.types.Timestamp): ts.Timestamp {
  return { type: 'timestamp' };
}

export function literalTypeToTS(t: schema.types.Literal): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function enumTypeToTS(t: schema.types.Enum): ts.Enum {
  return { type: 'enum', members: t.members };
}

export function tupleTypeToTS(t: schema.types.Tuple): ts.Tuple {
  return { type: 'tuple', elements: t.elements.map(typeToTS) };
}

export function listTypeToTS(t: schema.types.List): ts.List {
  return { type: 'list', elementType: typeToTS(t.elementType) };
}

export function mapTypeToTS(t: schema.types.Map): ts.Record {
  return { type: 'record', valueType: typeToTS(t.valueType) };
}

export function objectTypeToTS(t: schema.types.Object): ts.Object {
  return { type: 'object', properties: t.fields.map(objectPropertyTypeToTS) };
}

export function objectPropertyTypeToTS(t: schema.types.ObjectField): ts.ObjectProperty {
  return { type: typeToTS(t.type), optional: t.optional, name: t.name, docs: t.docs };
}

export function unionTypeToTS(t: schema.types.Union): ts.Union {
  return { type: 'union', variants: t.variants.map(typeToTS) };
}

export function aliasTypeToTS(t: schema.types.Alias): ts.Alias {
  return { type: 'alias', name: t.name };
}

export function typeToTS(t: schema.types.Type): ts.Type {
  switch (t.type) {
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
    case 'literal':
      return literalTypeToTS(t);
    case 'enum':
      return enumTypeToTS(t);
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
