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
    switch (aliasModel.value.type) {
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
          value: aliasModel.value,
        });
        return { flattenedModel, extractedAliasModels: [] };
      }
      case 'tuple': {
        const { flattenedType, extractedAliasModels } = flattenTupleType(aliasModel.value);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      case 'list': {
        const { flattenedType, extractedAliasModels } = flattenListType(aliasModel.value);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      case 'object': {
        const { flattenedType, extractedAliasModels } = flattenObjectType(aliasModel.value);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      case 'union': {
        const { flattenedType, extractedAliasModels } = flattenUnionType(aliasModel.value);
        const flattenedModel = createFlatAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel, extractedAliasModels };
      }
      default:
        assertNever(aliasModel.value);
    }
  }

  function flattenDocumentModel(documentModel: schema.DocumentModel): FlattenDocumentModelResult {
    const res = flattenObjectType({ type: 'object', fields: documentModel.fields });
    const flattenedModel = createFlatDocumentModel({
      name: documentModel.name,
      docs: documentModel.docs,
      fieldsById: Object.fromEntries(res.flattenedType.fields.map(field => [field.name, field])),
    });
    return { flattenedModel, extractedAliasModels: res.extractedAliasModels };
  }

  function flattenTupleType(tupleType: schema.types.Tuple): FlattenTupleTypeResult {
    const resultsForValues = tupleType.values.map(flattenType);
    const flattenedType: FlatTupleType = {
      type: 'tuple',
      values: resultsForValues.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForValues.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenListType(listType: schema.types.List): FlattenListTypeResult {
    const resultForOf = flattenType(listType.of);
    const flattenedType: FlatListType = {
      type: 'list',
      of: resultForOf.flattenedType,
    };
    return { flattenedType, extractedAliasModels: resultForOf.extractedAliasModels };
  }

  function flattenObjectType(objectType: schema.types.Object): FlattenObjectTypeResult {
    const resultForFields = objectType.fields.map(originalField => ({
      ...flattenType(originalField.type),
      originalField,
    }));
    const flattenedType: FlatObjectType = {
      type: 'object',
      fields: resultForFields.map(r => ({ ...r.originalField, type: r.flattenedType })),
    };
    const extractedAliasModels = resultForFields.map(r => r.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenUnionType(unionType: schema.types.Union): FlattenUnionTypeResult {
    const resultsForMembers = unionType.members.map(flattenType);
    const flattenedType: FlatUnionType = {
      type: 'union',
      members: resultsForMembers.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForMembers.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenType(type: schema.types.Type): FlattenTypeResult {
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
        // TODO: Implement
        const name = 'Placeholder';
        const docs = undefined;
        const aliasModel = createFlatAliasModel({ name, docs, value: type });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [aliasModel] };
      }
      case 'tuple':
        return flattenTupleType(type);
      case 'list':
        return flattenListType(type);
      case 'object': {
        // TODO: Implement
        const result = flattenObjectType(type);
        const name = 'Placeholder';
        const docs = undefined;
        const aliasModel = createFlatAliasModel({ name, docs, value: result.flattenedType });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      case 'union':
        return flattenUnionType(type);
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
