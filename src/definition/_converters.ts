import { definition } from '../definition/index.js';
import { schema } from '../schema/index.js';
import { assertNever } from '../util/assert.js';

export function primitiveTypeToSchema(t: definition.types.Primitive): schema.types.Primitive {
  switch (t) {
    case 'nil':
      return { type: 'nil' };
    case 'string':
      return { type: 'string' };
    case 'boolean':
      return { type: 'boolean' };
    case 'int':
      return { type: 'int' };
    case 'double':
      return { type: 'double' };
    case 'timestamp':
      return { type: 'timestamp' };
    default:
      assertNever(t);
  }
}

export function literalTypeToSchema(t: definition.types.Literal): schema.types.Literal {
  return {
    type: 'literal',
    value: t.value,
  };
}

export function enumTypeToSchema(t: definition.types.Enum): schema.types.Enum {
  return {
    type: 'enum',
    members: t.members,
  };
}

export function tupleTypeToSchema(t: definition.types.Tuple): schema.types.Tuple {
  return {
    type: 'tuple',
    elements: t.elements.map(typeToSchema),
  };
}

export function listTypeToSchema(t: definition.types.List): schema.types.List {
  return {
    type: 'list',
    of: typeToSchema(t.of),
  };
}

export function mapTypeToSchema(t: definition.types.Map): schema.types.Map {
  return {
    type: 'map',
    of: typeToSchema(t.of),
  };
}

export function objectTypeToSchema(t: definition.types.Object): schema.types.Object {
  return {
    type: 'object',
    fields: Object.entries(t.fields).map(([fieldName, field]) => fieldToSchema(fieldName, field)),
  };
}

export function fieldToSchema(fieldName: string, field: definition.types.ObjectField): schema.types.ObjectField {
  return {
    type: typeToSchema(field.type),
    optional: !!field.optional,
    docs: field.docs,
    name: fieldName,
  };
}

export function discriminatedUnionTypeToSchema(
  t: definition.types.DiscriminatedUnion
): schema.types.DiscriminatedUnion {
  return {
    type: 'discriminated-union',
    discriminant: t.discriminant,
    variants: t.variants.map(vt => {
      if (definition.isAliasType(vt)) return aliasTypeToSchema(vt);
      if (vt.type === 'object') return objectTypeToSchema(vt);
      assertNever(vt.type);
    }),
  };
}

export function simpleUnionTypeToSchema(t: definition.types.SimpleUnion): schema.types.SimpleUnion {
  return {
    type: 'simple-union',
    variants: t.variants.map(typeToSchema),
  };
}

export function unionTypeToSchema(t: definition.types.Union): schema.types.Union {
  if (definition.isDiscriminatedUnionType(t)) return discriminatedUnionTypeToSchema(t);
  if (definition.isSimpleUnionType(t)) return simpleUnionTypeToSchema(t);
  assertNever(t);
}

export function aliasTypeToSchema(t: definition.types.Alias): schema.types.Alias {
  return { type: 'alias', name: t };
}

export function typeToSchema(t: definition.types.Type): schema.types.Type {
  if (definition.isPrimitiveType(t)) {
    return primitiveTypeToSchema(t);
  }

  if (definition.isAliasType(t)) {
    return aliasTypeToSchema(t);
  }

  switch (t.type) {
    case 'literal':
      return literalTypeToSchema(t);
    case 'enum':
      return enumTypeToSchema(t);
    case 'tuple':
      return tupleTypeToSchema(t);
    case 'list':
      return listTypeToSchema(t);
    case 'map':
      return mapTypeToSchema(t);
    case 'object':
      return objectTypeToSchema(t);
    case 'union':
      return unionTypeToSchema(t);
    default:
      assertNever(t);
  }
}
