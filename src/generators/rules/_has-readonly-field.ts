import { schema } from '../../schema/index.js';
import { assertDefined, assertNever } from '../../util/assert.js';

export function typeHasReadonlyField(t: schema.rules.types.Type, adjustedSchema: schema.rules.Schema): boolean {
  switch (t.type) {
    case 'any':
    case 'unknown':
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'double':
    case 'timestamp':
    case 'string-literal':
    case 'int-literal':
    case 'boolean-literal':
    case 'string-enum':
    case 'int-enum':
      return false;
    case 'tuple':
      return tupleTypeHasReadonlyField(t, adjustedSchema);
    case 'list':
      return listTypeHasReadonlyField(t, adjustedSchema);
    case 'map':
      return mapTypeHasReadonlyField(t, adjustedSchema);
    case 'object':
      return objectTypeHasReadonlyField(t, adjustedSchema);
    case 'discriminated-union':
      return discriminatedUnionTypeHasReadonlyField(t, adjustedSchema);
    case 'simple-union':
      return simpleUnionTypeHasReadonlyField(t, adjustedSchema);
    case 'alias':
      return aliasTypeHasReadonlyField(t, adjustedSchema);
    default:
      assertNever(t);
  }
}

function tupleTypeHasReadonlyField(t: schema.rules.types.Tuple, adjustedSchema: schema.rules.Schema) {
  return t.elements.some(elementType => typeHasReadonlyField(elementType, adjustedSchema));
}

function listTypeHasReadonlyField(t: schema.rules.types.List, adjustedSchema: schema.rules.Schema) {
  return typeHasReadonlyField(t.elementType, adjustedSchema);
}

function mapTypeHasReadonlyField(t: schema.rules.types.Map, adjustedSchema: schema.rules.Schema) {
  return typeHasReadonlyField(t.valueType, adjustedSchema);
}

function objectTypeHasReadonlyField(t: schema.rules.types.Object, adjustedSchema: schema.rules.Schema) {
  return t.fields.some(field => field.readonly || typeHasReadonlyField(field.type, adjustedSchema));
}

function discriminatedUnionTypeHasReadonlyField(
  t: schema.rules.types.DiscriminatedUnion,
  adjustedSchema: schema.rules.Schema
) {
  const variants = adjustedSchema.resolveDiscriminatedUnionVariants(t);
  return variants.some(variant => {
    const objectType = (() => {
      switch (variant.type) {
        case 'alias-variant':
          return variant.originalObjectType;
        case 'object-variant':
          return variant.objectType;
        default:
          assertNever(variant);
      }
    })();
    return objectTypeHasReadonlyField(objectType, adjustedSchema);
  });
}

function simpleUnionTypeHasReadonlyField(t: schema.rules.types.SimpleUnion, adjustedSchema: schema.rules.Schema) {
  return t.variants.some(variantType => typeHasReadonlyField(variantType, adjustedSchema));
}

function aliasTypeHasReadonlyField(t: schema.rules.types.Alias, adjustedSchema: schema.rules.Schema) {
  const aliasModel = adjustedSchema.getAliasModel(t.name);
  assertDefined(aliasModel);
  return typeHasReadonlyField(aliasModel.type, adjustedSchema);
}
