import { schema } from '../../schema';
import { assertNever } from '../assert';

interface FlattenAliasModelResult {
  flattenedModel: schema.python.ExpressibleAliasModel;
  extractedAliasModels: schema.python.ExpressibleAliasModel[];
}

interface FlattenDocumentModelResult {
  flattenedModel: schema.python.ExpressibleDocumentModel;
  extractedAliasModels: schema.python.ExpressibleAliasModel[];
}

interface FlattenTupleTypeResult {
  flattenedType: schema.python.ExpressibleTupleType;
  extractedAliasModels: schema.python.ExpressibleAliasModel[];
}

interface FlattenListTypeResult {
  flattenedType: schema.python.ExpressibleListType;
  extractedAliasModels: schema.python.ExpressibleAliasModel[];
}

interface FlattenObjectTypeResult {
  flattenedType: schema.python.FlatObjectType;
  extractedAliasModels: schema.python.ExpressibleAliasModel[];
}

interface FlattenUnionTypeResult {
  flattenedType: schema.python.ExpressibleUnionType;
  extractedAliasModels: schema.python.ExpressibleAliasModel[];
}

interface FlattenTypeResult {
  flattenedType: schema.python.ExpressibleType;
  extractedAliasModels: schema.python.ExpressibleAliasModel[];
}

/**
 * Traverses a given schema and creates a new clone ensuring that all the schema types within it
 * are expressible. Converts inline object and enum definitions to alias models where necessary.
 *
 * @returns A new schema object.
 */
export function flattenSchema(prevSchema: schema.Schema): schema.python.ExpressibleSchema {
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
        return { flattenedModel: aliasModel as schema.python.ExpressibleAliasModel, extractedAliasModels: [] };
      }
      case 'tuple': {
        const { flattenedType, extractedAliasModels } = flattenTupleType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as schema.python.ExpressibleAliasModel, extractedAliasModels };
      }
      case 'list': {
        const { flattenedType, extractedAliasModels } = flattenListType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as schema.python.ExpressibleAliasModel, extractedAliasModels };
      }
      case 'object': {
        const { flattenedType, extractedAliasModels } = flattenObjectType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as schema.python.ExpressibleAliasModel, extractedAliasModels };
      }
      case 'union': {
        const { flattenedType, extractedAliasModels } = flattenUnionType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as schema.python.ExpressibleAliasModel, extractedAliasModels };
      }
      default:
        assertNever(aliasModel.value);
    }
  }

  function flattenDocumentModel(documentModel: schema.DocumentModel): FlattenDocumentModelResult {
    const res = flattenObjectType({ type: 'object', fields: documentModel.fields });

    const flattenedModel = schema.createDocumentModel({
      name: documentModel.name,
      docs: documentModel.docs,
      fieldsById: Object.fromEntries(res.flattenedType.fields.map(field => [field.name, field])),
    }) as schema.python.ExpressibleDocumentModel;

    return { flattenedModel, extractedAliasModels: res.extractedAliasModels };
  }

  function flattenTupleType(tupleType: schema.types.Tuple): FlattenTupleTypeResult {
    const resultsForValues = tupleType.values.map(flattenType);
    const flattenedType: schema.python.ExpressibleTupleType = {
      type: 'tuple',
      values: resultsForValues.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForValues.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenListType(listType: schema.types.List): FlattenListTypeResult {
    const resultForOf = flattenType(listType.of);
    const flattenedType: schema.python.ExpressibleListType = {
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
    const flattenedType: schema.python.FlatObjectType = {
      type: 'object',
      fields: resultForFields.map(r => ({ ...r.originalField, type: r.flattenedType })),
    };
    const extractedAliasModels = resultForFields.map(r => r.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenUnionType(unionType: schema.types.Union): FlattenUnionTypeResult {
    const resultsForMembers = unionType.members.map(flattenType);
    const flattenedType: schema.python.ExpressibleUnionType = {
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
        const aliasModel = schema.createAliasModel({
          name,
          docs,
          value: type,
        }) as schema.python.ExpressibleAliasModel;
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
        const aliasModel = schema.createAliasModel({
          name,
          docs,
          value: result.flattenedType,
        }) as schema.python.ExpressibleAliasModel;
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      case 'union':
        return flattenUnionType(type);
      default:
        assertNever(type);
    }
  }

  const newSchema = schema.createSchema() as schema.python.ExpressibleSchema;
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
