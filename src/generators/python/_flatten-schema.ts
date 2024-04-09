import lodash from 'lodash';

import { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import {
  FlatAliasModel,
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

interface FlattenTupleTypeResult {
  flattenedType: FlatTupleType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenListTypeResult {
  flattenedType: FlatListType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenMapTypeResult {
  flattenedType: FlatMapType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenObjectTypeResult {
  flattenedType: FlatObjectType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenDiscriminatedUnionTypeResult {
  flattenedType: FlatDiscriminatedUnionType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenSimpleUnionTypeResult {
  flattenedType: FlatSimpleUnionType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenTypeResult {
  flattenedType: FlatType;
  extractedAliasModels: FlatAliasModel[];
}

/**
 * Traverses a given schema and creates a new clone ensuring that all the schema types within it
 * are expressible. Converts inline object and enum definitions to alias models where necessary.
 *
 * @returns A new schema object.
 */
export function flattenSchema(prevSchema: schema.Schema): FlatSchema {
  function flattenTupleType(tupleType: schema.types.Tuple, aliasName: string): FlattenTupleTypeResult {
    const resultsForValues = tupleType.values.map((valueType, valueTypeIdx) =>
      flattenType(valueType, `${aliasName}_${valueTypeIdx}`)
    );
    const flattenedType: FlatTupleType = {
      type: 'tuple',
      values: resultsForValues.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForValues.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenListType(listType: schema.types.List, aliasName: string): FlattenListTypeResult {
    const resultForOf = flattenType(listType.of, aliasName);
    const flattenedType: FlatListType = {
      type: 'list',
      of: resultForOf.flattenedType,
    };
    return { flattenedType, extractedAliasModels: resultForOf.extractedAliasModels };
  }

  function flattenMapType(listType: schema.types.Map, aliasName: string): FlattenMapTypeResult {
    const resultForOf = flattenType(listType.of, aliasName);
    const flattenedType: FlatMapType = {
      type: 'map',
      of: resultForOf.flattenedType,
    };
    return { flattenedType, extractedAliasModels: resultForOf.extractedAliasModels };
  }

  function flattenObjectType(objectType: schema.types.Object, aliasName: string): FlattenObjectTypeResult {
    const resultsForFields = objectType.fields.map(field => {
      const flattenResult = flattenType(field.type, `${aliasName}${lodash.capitalize(field.name)}`);
      return { field, flattenResult };
    });
    const flattenedType: FlatObjectType = {
      type: 'object',
      fields: resultsForFields.map(r => ({
        docs: r.field.docs,
        name: r.field.name,
        optional: r.field.optional,
        type: r.flattenResult.flattenedType,
      })),
    };
    const extractedAliasModels = resultsForFields.map(r => r.flattenResult.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenDiscriminatedUnionType(
    unionType: schema.types.DiscriminatedUnion,
    aliasName: string
  ): FlattenDiscriminatedUnionTypeResult {
    // TODO: Implement core logic here
    const flattenedType: FlatDiscriminatedUnionType = {
      type: 'discriminated-union',
      discriminant: unionType.discriminant,
      variants: [],
    };
    return { flattenedType, extractedAliasModels: [] };
  }

  function flattenSimpleUnionType(
    unionType: schema.types.SimpleUnion,
    aliasName: string
  ): FlattenSimpleUnionTypeResult {
    const resultsForVariants = unionType.variants.map((variantType, variantIdx) =>
      flattenType(variantType, `${aliasName}_${variantIdx}`)
    );
    const flattenedType: FlatSimpleUnionType = {
      type: 'simple-union',
      variants: resultsForVariants.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForVariants.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenType(type: schema.types.Type, aliasName: string): FlattenTypeResult {
    switch (type.type) {
      case 'nil':
      case 'string':
      case 'boolean':
      case 'int':
      case 'double':
      case 'timestamp':
      case 'literal':
      case 'alias':
        return { flattenedType: type, extractedAliasModels: [] };
      case 'enum': {
        const name = aliasName;
        // TODO: Implement
        const docs = undefined;
        const aliasModel = createFlatAliasModel({ name, docs, type });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [aliasModel] };
      }
      case 'tuple':
        return flattenTupleType(type, aliasName);
      case 'list':
        return flattenListType(type, aliasName);
      case 'map':
        return flattenMapType(type, aliasName);
      case 'object': {
        const result = flattenObjectType(type, aliasName);
        const name = aliasName;
        // TODO: Implement
        const docs = undefined;
        const aliasModel = createFlatAliasModel({ name, docs, type: result.flattenedType });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      case 'discriminated-union':
        return flattenDiscriminatedUnionType(type, aliasName);
      case 'simple-union':
        return flattenSimpleUnionType(type, aliasName);
      default:
        assertNever(type);
    }
  }

  const newSchema = createFlatSchema();
  const prevSchemaClone = prevSchema.clone();
  const { aliasModels, documentModels } = prevSchemaClone;

  aliasModels.forEach(aliasModel => {
    let newModelType;
    let extractedAliasModels: FlatAliasModel[] | undefined;

    if (aliasModel.type.type === 'enum') {
      newModelType = aliasModel.type;
      extractedAliasModels = [];
    } else if (aliasModel.type.type === 'object') {
      ({ flattenedType: newModelType, extractedAliasModels } = flattenObjectType(aliasModel.type, aliasModel.name));
    } else {
      ({ flattenedType: newModelType, extractedAliasModels } = flattenType(aliasModel.type, aliasModel.name));
    }
    const flattenedModel = createFlatAliasModel({
      name: aliasModel.name,
      docs: aliasModel.docs,
      type: newModelType,
    });
    newSchema.addModels(flattenedModel, ...extractedAliasModels);
  });

  documentModels.forEach(documentModel => {
    const { flattenedType, extractedAliasModels } = flattenObjectType(documentModel.type, documentModel.name);
    const flattenedModel = createFlatDocumentModel({
      name: documentModel.name,
      docs: documentModel.docs,
      type: flattenedType,
    });
    newSchema.addModels(flattenedModel, ...extractedAliasModels);
  });

  return newSchema;
}
