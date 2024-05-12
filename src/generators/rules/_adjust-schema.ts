import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';

export function adjustSchemaForRules(prevSchema: schema.Schema): schema.rules.Schema {
  function flattenTupleType(tupleType: schema.types.Tuple): schema.rules.types.Tuple {
    return {
      type: 'tuple',
      elements: tupleType.elements.map(valueType => flattenType(valueType)),
    };
  }

  function flattenListType(listType: schema.types.List): schema.rules.types.List {
    return {
      type: 'list',
      elementType: flattenType(listType.elementType),
    };
  }

  function flattenMapType(mapType: schema.types.Map): schema.rules.types.Map {
    return {
      type: 'map',
      valueType: flattenType(mapType.valueType),
    };
  }

  function flattenObjectType(objectType: schema.types.Object): schema.rules.types.Object {
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
  ): schema.rules.types.DiscriminatedUnion {
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

  function flattenSimpleUnionType(unionType: schema.types.SimpleUnion): schema.rules.types.SimpleUnion {
    return {
      type: 'simple-union',
      variants: unionType.variants.map(flattenType),
    };
  }

  function flattenType(type: schema.types.Type): schema.rules.types.Type {
    switch (type.type) {
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

  const newSchema = schema.rules.createSchema();
  const prevSchemaClone = prevSchema.clone();
  const { aliasModels, documentModels } = prevSchemaClone;

  const newSchemaAliasModels = aliasModels.map(aliasModel =>
    schema.rules.createAliasModel({
      name: aliasModel.name,
      docs: aliasModel.docs,
      value: flattenType(aliasModel.type),
    })
  );
  const newSchemaDocumentModels = documentModels.map(documentModel =>
    schema.rules.createDocumentModel({
      name: documentModel.name,
      docs: documentModel.docs,
      type: flattenObjectType(documentModel.type),
      path: documentModel.path,
    })
  );

  newSchema.addModelGroup([...newSchemaAliasModels, ...newSchemaDocumentModels]);

  return newSchema;
}
