import { python } from '../../platforms/python';
import { schema } from '../../schema';
import { assertNever } from '../assert';

interface FlattenAliasModelResult {
  flattenedModel: python.schema.ExpressibleAliasModel;
  extractedAliasModels: python.schema.ExpressibleAliasModel[];
}

interface FlattenDocumentModelResult {
  flattenedModel: python.schema.ExpressibleDocumentModel;
  extractedAliasModels: python.schema.ExpressibleAliasModel[];
}

interface FlattenTupleTypeResult {
  flattenedType: python.schema.ExpressibleTupleType;
  extractedAliasModels: python.schema.ExpressibleAliasModel[];
}

interface FlattenListTypeResult {
  flattenedType: python.schema.ExpressibleListType;
  extractedAliasModels: python.schema.ExpressibleAliasModel[];
}

interface FlattenMapTypeResult {
  flattenedType: python.schema.FlatMapType;
  extractedAliasModels: python.schema.ExpressibleAliasModel[];
}

interface FlattenUnionTypeResult {
  flattenedType: python.schema.ExpressibleUnionType;
  extractedAliasModels: python.schema.ExpressibleAliasModel[];
}

interface FlattenTypeResult {
  flattenedType: python.schema.ExpressibleType;
  extractedAliasModels: python.schema.ExpressibleAliasModel[];
}

/**
 * Traverses a given schema and creates a new clone ensuring that all the schema types within it
 * are expressible. Converts inline map and enum definitions to alias models where necessary.
 *
 * @returns A new schema object.
 */
export function flattenSchema(prevSchema: schema.Schema): python.schema.ExpressibleSchema {
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
        return { flattenedModel: aliasModel as python.schema.ExpressibleAliasModel, extractedAliasModels: [] };
      }
      case 'tuple': {
        const { flattenedType, extractedAliasModels } = flattenTupleType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as python.schema.ExpressibleAliasModel, extractedAliasModels };
      }
      case 'list': {
        const { flattenedType, extractedAliasModels } = flattenListType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as python.schema.ExpressibleAliasModel, extractedAliasModels };
      }
      case 'map': {
        const { flattenedType, extractedAliasModels } = flattenMapType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as python.schema.ExpressibleAliasModel, extractedAliasModels };
      }
      case 'union': {
        const { flattenedType, extractedAliasModels } = flattenUnionType(aliasModel.value);
        const flattenedModel = schema.createAliasModel({
          name: aliasModel.name,
          docs: aliasModel.docs,
          value: flattenedType,
        });
        return { flattenedModel: flattenedModel as python.schema.ExpressibleAliasModel, extractedAliasModels };
      }
      default:
        assertNever(aliasModel.value);
    }
  }

  function flattenDocumentModel(documentModel: schema.DocumentModel): FlattenDocumentModelResult {
    const res = flattenMapType({ type: 'map', fields: documentModel.fields });

    const flattenedModel = schema.createDocumentModel({
      name: documentModel.name,
      docs: documentModel.docs,
      fieldsById: Object.fromEntries(res.flattenedType.fields.map(field => [field.name, field])),
    }) as python.schema.ExpressibleDocumentModel;

    return { flattenedModel, extractedAliasModels: res.extractedAliasModels };
  }

  function flattenTupleType(tupleType: schema.types.Tuple): FlattenTupleTypeResult {
    const resultsForValues = tupleType.values.map(flattenType);
    const flattenedType: python.schema.ExpressibleTupleType = {
      type: 'tuple',
      values: resultsForValues.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForValues.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenListType(listType: schema.types.List): FlattenListTypeResult {
    const resultForOf = flattenType(listType.of);
    const flattenedType: python.schema.ExpressibleListType = {
      type: 'list',
      of: resultForOf.flattenedType,
    };
    return { flattenedType, extractedAliasModels: resultForOf.extractedAliasModels };
  }

  function flattenMapType(mapType: schema.types.Map): FlattenMapTypeResult {
    const resultForFields = mapType.fields.map(originalField => ({
      ...flattenType(originalField.type),
      originalField,
    }));
    const flattenedType: python.schema.FlatMapType = {
      type: 'map',
      fields: resultForFields.map(r => ({ ...r.originalField, type: r.flattenedType })),
    };
    const extractedAliasModels = resultForFields.map(r => r.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenUnionType(unionType: schema.types.Union): FlattenUnionTypeResult {
    const resultsForMembers = unionType.members.map(flattenType);
    const flattenedType: python.schema.ExpressibleUnionType = {
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
        }) as python.schema.ExpressibleAliasModel;
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [aliasModel] };
      }
      case 'tuple':
        return flattenTupleType(type);
      case 'list':
        return flattenListType(type);
      case 'map': {
        // TODO: Implement
        const result = flattenMapType(type);
        const name = 'Placeholder';
        const docs = undefined;
        const aliasModel = schema.createAliasModel({
          name,
          docs,
          value: result.flattenedType,
        }) as python.schema.ExpressibleAliasModel;
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      case 'union':
        return flattenUnionType(type);
      default:
        assertNever(type);
    }
  }

  const newSchema = schema.create() as python.schema.ExpressibleSchema;
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
