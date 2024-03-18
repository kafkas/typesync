import { ts } from '../../platforms/ts';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';

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

export function timestampTypeToTS(_t: schema.types.Timestamp): ts.Timestamp {
  return { type: 'timestamp' };
}

export function literalTypeToTS(t: schema.types.Literal): ts.Literal {
  return { type: 'literal', value: t.value };
}

export function enumTypeToTS(t: schema.types.Enum): ts.Enum {
  return { type: 'enum', items: t.items };
}

export function tupleTypeToTS(t: schema.types.Tuple): ts.Tuple {
  return { type: 'tuple', values: t.values.map(typeToTS) };
}

export function listTypeToTS(t: schema.types.List): ts.List {
  return { type: 'list', of: typeToTS(t.of) };
}

export function objectTypeToTS(t: schema.types.Object): ts.Object {
  return { type: 'object', fields: t.fields.map(objectFieldTypeToTS) };
}

export function objectFieldTypeToTS(t: schema.types.ObjectField): ts.ObjectField {
  return { type: typeToTS(t.type), optional: t.optional, name: t.name, docs: t.docs };
}

export function unionTypeToTS(t: schema.types.Union): ts.Union {
  return { type: 'union', members: t.members.map(typeToTS) };
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
    case 'object':
      return objectTypeToTS(t);
    case 'union':
      return unionTypeToTS(t);
    case 'alias':
      return aliasTypeToTS(t);
    default:
      assertNever(t);
  }
}
