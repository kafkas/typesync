import { definition } from '../../definition';
import type { schema } from '../../schema';
import { assertNever } from '../../util/assert';

export function primitiveTypeToSchema(vt: definition.types.Primitive): schema.types.Primitive {
  switch (vt) {
    case 'nil':
      return { type: 'nil' };
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'boolean' };
    case 'int':
      return { type: 'int' };
    case 'timestamp':
      return { type: 'timestamp' };
    default:
      assertNever(vt);
  }
}

export function literalTypeToSchema(vt: definition.types.Literal): schema.types.Literal {
  return {
    type: 'literal',
    value: vt.value,
  };
}

export function enumTypeToSchema(vt: definition.types.Enum): schema.types.Enum {
  return {
    type: 'enum',
    items: vt.items,
  };
}

export function tupleTypeToSchema(vt: definition.types.Tuple): schema.types.Tuple {
  return {
    type: 'tuple',
    values: vt.values.map(typeToSchema),
  };
}

export function listTypeToSchema(vt: definition.types.List): schema.types.List {
  return {
    type: 'list',
    of: typeToSchema(vt.of),
  };
}

export function objectTypeToSchema(vt: definition.types.Object): schema.types.Object {
  return {
    type: 'object',
    fields: Object.entries(vt.fields).map(([fieldName, field]) => fieldToSchema(fieldName, field)),
  };
}

export function fieldToSchema(fieldName: string, field: definition.types.Field): schema.types.Field {
  return {
    type: typeToSchema(field.type),
    optional: !!field.optional,
    docs: field.docs,
    name: fieldName,
  };
}

export function typeToSchema(vt: definition.types.Type): schema.types.Type {
  if (definition.isPrimitiveType(vt)) {
    return primitiveTypeToSchema(vt);
  }

  if (typeof vt === 'string') {
    return { type: 'alias', name: vt };
  }

  if (Array.isArray(vt)) {
    return {
      type: 'union',
      members: vt.map(typeToSchema),
    };
  }

  switch (vt.type) {
    case 'literal':
      return literalTypeToSchema(vt);
    case 'enum':
      return enumTypeToSchema(vt);
    case 'tuple':
      return tupleTypeToSchema(vt);
    case 'list':
      return listTypeToSchema(vt);
    case 'object':
      return objectTypeToSchema(vt);
    default:
      assertNever(vt);
  }
}
