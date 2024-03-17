import { ts } from '../../platforms/ts';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';

export function primitiveTypeToTS(t: schema.types.Primitive): ts.Primitive {
  switch (t.type) {
    case 'nil':
      return { type: 'null' };
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'boolean' };
    case 'int':
      return { type: 'number' };
    case 'timestamp':
      return { type: 'timestamp' };
    default:
      assertNever(t.type);
  }
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
  return { type: 'object', fields: t.fields.map(fieldTypeToTS) };
}

export function fieldTypeToTS(t: schema.types.Field): ts.Field {
  return { type: typeToTS(t.type), optional: t.optional, name: t.name, docs: t.docs };
}

export function unionTypeToTS(t: schema.types.Union): ts.Type {
  return { type: 'union', members: t.members.map(typeToTS) };
}

export function aliasTypeToTS(t: schema.types.Alias): ts.Type {
  return { type: 'alias', name: t.name };
}

export function typeToTS(t: schema.types.Type): ts.Type {
  if (schema.isPrimitiveType(t)) {
    return primitiveTypeToTS(t);
  }
  switch (t.type) {
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
