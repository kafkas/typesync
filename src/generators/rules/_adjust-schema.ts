import { rules } from '../../platforms/rules/index.js';
import { Schema, schema } from '../../schema-new/index.js';
import { assertNever } from '../../util/assert.js';

export function adjustSchemaForRules(prevSchema: Schema): rules.schema.Schema {
  function flattenTupleType(tupleType: schema.types.Tuple): rules.schema.types.Tuple {
    return {
      type: 'tuple',
      elements: tupleType.elements.map(valueType => flattenType(valueType)),
    };
  }

  function flattenListType(listType: schema.types.List): rules.schema.types.List {
    return {
      type: 'list',
      elementType: flattenType(listType.elementType),
    };
  }

  function flattenMapType(mapType: schema.types.Map): rules.schema.types.Map {
    return {
      type: 'map',
      valueType: flattenType(mapType.valueType),
    };
  }

  function flattenObjectType(objectType: schema.types.Object): rules.schema.types.Object {
    return {
      type: 'object',
      fields: objectType.fields.map(field => ({
        docs: field.docs,
        name: field.name,
        optional: field.optional,
        type: flattenType(field.type),
      })),
      additionalFields: objectType.additionalFields,
    };
  }

  function flattenDiscriminatedUnionType(
    unionType: schema.types.DiscriminatedUnion
  ): rules.schema.types.DiscriminatedUnion {
    return {
      type: 'discriminated-union',
      discriminant: unionType.discriminant,
      variants: unionType.variants.map(vt => {
        switch (vt.type) {
          case 'alias':
            return vt;
          case 'object':
            return flattenObjectType(vt);
          default:
            assertNever(vt);
        }
      }),
    };
  }

  function flattenSimpleUnionType(unionType: schema.types.SimpleUnion): rules.schema.types.SimpleUnion {
    return {
      type: 'simple-union',
      variants: unionType.variants.map(flattenType),
    };
  }

  function flattenType(type: schema.types.Type): rules.schema.types.Type {
    switch (type.type) {
      case 'unknown':
      case 'nil':
        return { type: 'unknown' };
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
      case 'alias':
        return type;
      case 'tuple':
        return flattenTupleType(type);
      case 'list':
        return flattenListType(type);
      case 'map':
        return flattenMapType(type);
      case 'object':
        return flattenObjectType(type);
      case 'discriminated-union':
        return flattenDiscriminatedUnionType(type);
      case 'simple-union':
        return flattenSimpleUnionType(type);
      default:
        assertNever(type);
    }
  }

  const newSchema = rules.schema.createSchema();
  const prevSchemaClone = prevSchema.clone();
  const { aliasModels, documentModels } = prevSchemaClone;

  const newSchemaAliasModels = aliasModels.map(aliasModel =>
    rules.schema.createAliasModel({
      name: aliasModel.name,
      docs: aliasModel.docs,
      value: flattenType(aliasModel.type),
    })
  );
  const newSchemaDocumentModels = documentModels.map(aliasModel =>
    rules.schema.createDocumentModel({
      name: aliasModel.name,
      docs: aliasModel.docs,
      type: flattenObjectType(aliasModel.type),
    })
  );

  newSchema.addModelGroup([...newSchemaAliasModels, ...newSchemaDocumentModels]);

  return newSchema;
}
