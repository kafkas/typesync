import { definition } from '../definition-new/index.js';
import { schema } from '../schema-new/index.js';
import { assert, assertNever } from '../util/assert.js';

export function definitionConverters(def: definition.Definition) {
  function resolveAliasModel(modelName: string) {
    const model = def[modelName];
    assert(!!model, `Could not resolve alias model. The definition does not have a '${modelName}' model.`);
    assert(
      model.model === 'alias',
      `Could not resolve alias model. The '${modelName}' definition model is not an alias.`
    );
    return model;
  }

  function primitiveTypeToSchema(t: definition.types.Primitive): schema.types.Primitive {
    switch (t) {
      case 'unknown':
        return { type: 'unknown' };
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

  function stringLiteralTypeToSchema(t: definition.types.StringLiteral): schema.types.StringLiteral {
    return { type: 'string-literal', value: t.value };
  }

  function intLiteralTypeToSchema(t: definition.types.IntLiteral): schema.types.IntLiteral {
    return { type: 'int-literal', value: t.value };
  }

  function booleanLiteralTypeToSchema(t: definition.types.BooleanLiteral): schema.types.BooleanLiteral {
    return { type: 'boolean-literal', value: t.value };
  }

  function literalTypeToSchema(t: definition.types.Literal): schema.types.Literal {
    if (definition.isStringLiteralType(t)) return stringLiteralTypeToSchema(t);
    else if (definition.isIntLiteralType(t)) return intLiteralTypeToSchema(t);
    else if (definition.isBooleanLiteralType(t)) return booleanLiteralTypeToSchema(t);
    else assertNever(t);
  }

  function stringEnumTypeToSchema(t: definition.types.StringEnum): schema.types.StringEnum {
    return { type: 'string-enum', members: t.members };
  }

  function intEnumTypeToSchema(t: definition.types.IntEnum): schema.types.IntEnum {
    return { type: 'int-enum', members: t.members };
  }

  function enumTypeToSchema(t: definition.types.Enum): schema.types.Enum {
    if (definition.isStringEnumType(t)) return stringEnumTypeToSchema(t);
    else if (definition.isIntEnumType(t)) return intEnumTypeToSchema(t);
    else assertNever(t);
  }

  function tupleTypeToSchema(t: definition.types.Tuple): schema.types.Tuple {
    return {
      type: 'tuple',
      elements: t.elements.map(typeToSchema),
    };
  }

  function listTypeToSchema(t: definition.types.List): schema.types.List {
    return {
      type: 'list',
      elementType: typeToSchema(t.elementType),
    };
  }

  function mapTypeToSchema(t: definition.types.Map): schema.types.Map {
    return {
      type: 'map',
      valueType: typeToSchema(t.valueType),
    };
  }

  function objectTypeToSchema(t: definition.types.Object): schema.types.Object {
    return {
      type: 'object',
      fields: Object.entries(t.fields).map(([fieldName, field]) => fieldToSchema(fieldName, field)),
      additionalFields: !!t.additionalFields,
    };
  }

  function fieldToSchema(fieldName: string, field: definition.types.ObjectField): schema.types.ObjectField {
    return {
      type: typeToSchema(field.type),
      optional: !!field.optional,
      docs: field.docs ?? null,
      name: fieldName,
    };
  }

  function discriminatedUnionTypeToSchema(t: definition.types.DiscriminatedUnion): schema.types.DiscriminatedUnion {
    return {
      type: 'discriminated-union',
      discriminant: t.discriminant,
      variants: t.variants.map(vt => {
        if (definition.isAliasType(vt)) {
          const aliasModel = resolveAliasModel(vt);
          assert(definition.isObjectType(aliasModel.type));
          const field = aliasModel.type.fields[t.discriminant];
          assert(field && definition.isStringLiteralType(field.type));
          return {
            type: 'alias-variant',
            aliasType: aliasTypeToSchema(vt),
            discriminantType: stringLiteralTypeToSchema(field.type),
            originalObjectType: objectTypeToSchema(aliasModel.type),
          };
        } else if (vt.type === 'object') {
          const field = vt.fields[t.discriminant];
          assert(field && definition.isStringLiteralType(field.type));
          return {
            type: 'object-variant',
            objectType: objectTypeToSchema(vt),
            discriminantType: stringLiteralTypeToSchema(field.type),
          };
        } else {
          assertNever(vt.type);
        }
      }),
    };
  }

  function simpleUnionTypeToSchema(t: definition.types.SimpleUnion): schema.types.SimpleUnion {
    return {
      type: 'simple-union',
      variants: t.variants.map(typeToSchema),
    };
  }

  function unionTypeToSchema(t: definition.types.Union): schema.types.Union {
    if (definition.isDiscriminatedUnionType(t)) return discriminatedUnionTypeToSchema(t);
    if (definition.isSimpleUnionType(t)) return simpleUnionTypeToSchema(t);
    assertNever(t);
  }

  function aliasTypeToSchema(t: definition.types.Alias): schema.types.Alias {
    return { type: 'alias', name: t };
  }

  function typeToSchema(t: definition.types.Type): schema.types.Type {
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

  return {
    objectTypeToSchema,
    typeToSchema,
  };
}
