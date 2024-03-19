import { capitalize } from 'lodash';

import { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import {
  FlatAliasModel,
  FlatDocumentModel,
  FlatListType,
  FlatObjectType,
  FlatSchema,
  FlatTupleType,
  FlatType,
  FlatUnionType,
  createFlatAliasModel,
  createFlatDocumentModel,
  createFlatSchema,
} from './_schema';

interface FlattenAliasModelResult {
  flattenedModel: FlatAliasModel;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenDocumentModelResult {
  flattenedModel: FlatDocumentModel;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenTupleTypeResult {
  flattenedType: FlatTupleType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenListTypeResult {
  flattenedType: FlatListType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenObjectTypeResult {
  flattenedType: FlatObjectType;
  extractedAliasModels: FlatAliasModel[];
}

interface FlattenUnionTypeResult {
  flattenedType: FlatUnionType;
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
  function flattenAliasModel(aliasModel: schema.AliasModel): FlattenAliasModelResult {
    switch (aliasModel.type.type) {
      case 'nil':
      case 'string':
      case 'boolean':
      case 'int':
      case 'timestamp':
      case 'literal':
      case 'enum':
      case 'alias': {
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          type: aliasModel.type,
        });
        return { flattenedModel, extractedAliasModels: [] };
      }
      case 'tuple': {
        const { flattenedType, extractedAliasModels } = flattenTupleType(aliasModel.type, aliasModel.name);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          type: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      case 'list': {
        const { flattenedType, extractedAliasModels } = flattenListType(aliasModel.type, aliasModel.name);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          type: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      case 'object': {
        const { flattenedType, extractedAliasModels } = flattenObjectType(aliasModel.type, aliasModel.name);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          type: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      case 'union': {
        const { flattenedType, extractedAliasModels } = flattenUnionType(aliasModel.type, aliasModel.name);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          type: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      default:
        assertNever(aliasModel.type);
    }
  }

  function flattenDocumentModel(documentModel: schema.DocumentModel): FlattenDocumentModelResult {
    const res = flattenObjectType(documentModel.type, documentModel.name);
    const flattenedModel = createFlatDocumentModel({
      name: documentModel.name,
      docs: documentModel.docs,
      type: res.flattenedType,
    });
    return { flattenedModel, extractedAliasModels: res.extractedAliasModels };
  }

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

  function flattenObjectType(objectType: schema.types.Object, aliasName: string): FlattenObjectTypeResult {
    const resultsForFields = objectType.fields.map(field => {
      const flattenResult = flattenType(field.type, `${aliasName}${capitalize(field.name)}`);
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

  function flattenUnionType(unionType: schema.types.Union, aliasName: string): FlattenUnionTypeResult {
    const resultsForMembers = unionType.members.map((memberType, memberIdx) =>
      flattenType(memberType, `${aliasName}_${memberIdx}`)
    );
    const flattenedType: FlatUnionType = {
      type: 'union',
      members: resultsForMembers.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForMembers.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenType(type: schema.types.Type, aliasName: string): FlattenTypeResult {
    switch (type.type) {
      case 'nil':
      case 'string':
      case 'boolean':
      case 'int':
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
      case 'object': {
        const result = flattenObjectType(type, aliasName);
        const name = aliasName;
        // TODO: Implement
        const docs = undefined;
        const aliasModel = createFlatAliasModel({ name, docs, type: result.flattenedType });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      case 'union':
        return flattenUnionType(type, aliasName);
      default:
        assertNever(type);
    }
  }

  const newSchema = createFlatSchema();
  const prevSchemaClone = prevSchema.clone();
  const { aliasModels, documentModels } = prevSchemaClone;

  aliasModels.forEach(aliasModel => {
    const { flattenedModel, extractedAliasModels } = flattenAliasModel(aliasModel);
    newSchema.addModels(flattenedModel, ...extractedAliasModels);
  });

  documentModels.forEach(documentModel => {
    const { flattenedModel, extractedAliasModels } = flattenDocumentModel(documentModel);
    newSchema.addModels(flattenedModel, ...extractedAliasModels);
  });

  return newSchema;
}
