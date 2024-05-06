import { Schema, schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import {
  FlatDiscriminatedUnionType,
  FlatListType,
  FlatMapType,
  FlatObjectType,
  FlatSchema,
  FlatSimpleUnionType,
  FlatTupleType,
  FlatType,
  createFlatAliasModel,
  createFlatDocumentModel,
  createFlatSchema,
} from './_schema.js';

export function flattenSchema(prevSchema: Schema): FlatSchema {
  function flattenTupleType(tupleType: schema.types.Tuple): FlatTupleType {
    return {
      type: 'tuple',
      elements: tupleType.elements.map(valueType => flattenType(valueType)),
    };
  }

  function flattenListType(listType: schema.types.List): FlatListType {
    return {
      type: 'list',
      elementType: flattenType(listType.elementType),
    };
  }

  function flattenMapType(mapType: schema.types.Map): FlatMapType {
    return {
      type: 'map',
      valueType: flattenType(mapType.valueType),
    };
  }

  function flattenObjectType(objectType: schema.types.Object): FlatObjectType {
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

  function flattenDiscriminatedUnionType(unionType: schema.types.DiscriminatedUnion): FlatDiscriminatedUnionType {
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

  function flattenSimpleUnionType(unionType: schema.types.SimpleUnion): FlatSimpleUnionType {
    return {
      type: 'simple-union',
      variants: unionType.variants.map(flattenType),
    };
  }

  function flattenType(type: schema.types.Type): FlatType {
    switch (type.type) {
      case 'unknown':
      case 'nil':
        return { type: 'unknown' };
      case 'string':
      case 'boolean':
      case 'int':
      case 'double':
      case 'timestamp':
      case 'literal':
      case 'enum':
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

  const newSchema = createFlatSchema();
  const prevSchemaClone = prevSchema.clone();
  const { aliasModels, documentModels } = prevSchemaClone;

  const newSchemaAliasModels = aliasModels.map(aliasModel =>
    createFlatAliasModel({
      name: aliasModel.name,
      docs: aliasModel.docs,
      type: flattenType(aliasModel.type),
    })
  );
  const newSchemaDocumentModels = documentModels.map(aliasModel =>
    createFlatDocumentModel({
      name: aliasModel.name,
      docs: aliasModel.docs,
      type: flattenObjectType(aliasModel.type),
    })
  );

  newSchema.addModelGroup([...newSchemaAliasModels, ...newSchemaDocumentModels]);

  return newSchema;
}
