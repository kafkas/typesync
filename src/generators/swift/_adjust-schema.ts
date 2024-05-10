import { Schema, schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { pascalCase } from '../../util/casing.js';
import { extractDiscriminantValue } from '../../util/extract-discriminant-value.js';

interface FlattenTupleTypeResult {
  flattenedType: schema.swift.types.Tuple;
  extractedAliasModels: schema.swift.AliasModel[];
}

interface FlattenListTypeResult {
  flattenedType: schema.swift.types.List;
  extractedAliasModels: schema.swift.AliasModel[];
}

interface FlattenMapTypeResult {
  flattenedType: schema.swift.types.Map;
  extractedAliasModels: schema.swift.AliasModel[];
}

interface FlattenObjectTypeResult {
  flattenedType: schema.swift.types.Object;
  extractedAliasModels: schema.swift.AliasModel[];
}

interface FlattenDiscriminatedUnionTypeResult {
  flattenedType: schema.swift.types.DiscriminatedUnion;
  extractedAliasModels: schema.swift.AliasModel[];
}

interface FlattenSimpleUnionTypeResult {
  flattenedType: schema.swift.types.SimpleUnion;
  extractedAliasModels: schema.swift.AliasModel[];
}

interface FlattenTypeResult {
  flattenedType: schema.swift.types.Type;
  extractedAliasModels: schema.swift.AliasModel[];
}

/**
 * Traverses a given schema and creates a new clone ensuring that all the schema types within it
 * are expressible. Converts inline object and enum definitions to alias models where necessary.
 *
 * @returns A new schema object.
 */
export function adjustSchemaForSwift(prevSchema: Schema): schema.swift.Schema {
  function flattenTupleType(tupleType: schema.types.Tuple, aliasName: string): FlattenTupleTypeResult {
    const resultsForValues = tupleType.elements.map((valueType, valueTypeIdx) =>
      flattenType(valueType, `${aliasName}_${valueTypeIdx + 1}`)
    );
    const flattenedType: schema.swift.types.Tuple = {
      type: 'tuple',
      elements: resultsForValues.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForValues.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenListType(listType: schema.types.List, aliasName: string): FlattenListTypeResult {
    const resultForElementType = flattenType(listType.elementType, `${aliasName}Element`);
    const flattenedType: schema.swift.types.List = {
      type: 'list',
      elementType: resultForElementType.flattenedType,
    };
    return { flattenedType, extractedAliasModels: resultForElementType.extractedAliasModels };
  }

  function flattenMapType(mapType: schema.types.Map, aliasName: string): FlattenMapTypeResult {
    const resultForValueType = flattenType(mapType.valueType, `${aliasName}Value`);
    const flattenedType: schema.swift.types.Map = {
      type: 'map',
      valueType: resultForValueType.flattenedType,
    };
    return { flattenedType, extractedAliasModels: resultForValueType.extractedAliasModels };
  }

  function flattenObjectType(objectType: schema.types.Object, aliasName: string): FlattenObjectTypeResult {
    const resultsForFields = objectType.fields.map(field => {
      const flattenResult = flattenType(field.type, `${aliasName}${pascalCase(field.name)}`);
      return { field, flattenResult };
    });
    const flattenedType: schema.swift.types.Object = {
      type: 'object',
      fields: resultsForFields.map(r => ({
        docs: r.field.docs,
        name: r.field.name,
        optional: r.field.optional,
        type: r.flattenResult.flattenedType,
      })),
      additionalFields: objectType.additionalFields,
    };
    const extractedAliasModels = resultsForFields.map(r => r.flattenResult.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenDiscriminatedUnionType(
    unionType: schema.types.DiscriminatedUnion,
    aliasName: string
  ): FlattenDiscriminatedUnionTypeResult {
    const flattenedType: schema.swift.types.DiscriminatedUnion = {
      type: 'discriminated-union',
      discriminant: unionType.discriminant,
      variants: [],
    };
    const extractedAliasModels: schema.swift.AliasModel[] = [];

    unionType.variants.forEach(variantType => {
      if (variantType.type === 'object') {
        const discriminantValue = extractDiscriminantValue(unionType, variantType);
        const name = `${aliasName}${pascalCase(discriminantValue)}`;
        const res = flattenObjectType(variantType, name);
        const aliasModel = schema.swift.createAliasModel({ name, docs: null, value: res.flattenedType });
        extractedAliasModels.push(...res.extractedAliasModels, aliasModel);
        flattenedType.variants.push({ type: 'alias', name });
      } else if (variantType.type === 'alias') {
        flattenedType.variants.push(variantType);
      } else {
        assertNever(variantType);
      }
    });

    return { flattenedType, extractedAliasModels };
  }

  function flattenSimpleUnionType(
    unionType: schema.types.SimpleUnion,
    aliasName: string
  ): FlattenSimpleUnionTypeResult {
    const resultsForVariants = unionType.variants.map((variantType, variantIdx) =>
      flattenType(variantType, `${aliasName}_${variantIdx + 1}`)
    );
    const flattenedType: schema.swift.types.SimpleUnion = {
      type: 'simple-union',
      variants: resultsForVariants.map(res => res.flattenedType),
    };
    const extractedAliasModels = resultsForVariants.map(res => res.extractedAliasModels).flat(1);
    return { flattenedType, extractedAliasModels };
  }

  function flattenType(type: schema.types.Type, aliasName: string): FlattenTypeResult {
    switch (type.type) {
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
      case 'alias':
        return { flattenedType: type, extractedAliasModels: [] };
      case 'string-enum':
      case 'int-enum': {
        const name = aliasName;
        const aliasModel = schema.swift.createAliasModel({ name, docs: null, value: type });
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
        const aliasModel = schema.swift.createAliasModel({ name, docs: null, value: result.flattenedType });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      case 'discriminated-union': {
        const result = flattenDiscriminatedUnionType(type, aliasName);
        const name = aliasName;
        const aliasModel = schema.swift.createAliasModel({ name, docs: null, value: result.flattenedType });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      case 'simple-union': {
        const result = flattenSimpleUnionType(type, aliasName);
        const name = aliasName;
        const aliasModel = schema.swift.createAliasModel({ name, docs: null, value: result.flattenedType });
        const flattenedType: schema.types.Alias = { type: 'alias', name };
        return { flattenedType, extractedAliasModels: [...result.extractedAliasModels, aliasModel] };
      }
      default:
        assertNever(type);
    }
  }

  const newSchema = schema.swift.createSchema();
  const prevSchemaClone = prevSchema.clone();
  const { aliasModels, documentModels } = prevSchemaClone;

  const newSchemaAliasModels: schema.swift.AliasModel[] = [];
  const newSchemaDocumentModels: schema.swift.DocumentModel[] = [];

  aliasModels.forEach(aliasModel => {
    let newModelType;

    if (aliasModel.type.type === 'string-enum' || aliasModel.type.type === 'int-enum') {
      newModelType = aliasModel.type;
    } else if (aliasModel.type.type === 'object') {
      const { flattenedType, extractedAliasModels } = flattenObjectType(aliasModel.type, aliasModel.name);
      newSchemaAliasModels.push(...extractedAliasModels);
      newModelType = flattenedType;
    } else if (aliasModel.type.type === 'discriminated-union') {
      const { flattenedType, extractedAliasModels } = flattenDiscriminatedUnionType(aliasModel.type, aliasModel.name);
      newSchemaAliasModels.push(...extractedAliasModels);
      newModelType = flattenedType;
    } else if (aliasModel.type.type === 'simple-union') {
      const { flattenedType, extractedAliasModels } = flattenSimpleUnionType(aliasModel.type, aliasModel.name);
      newSchemaAliasModels.push(...extractedAliasModels);
      newModelType = flattenedType;
    } else {
      const { flattenedType, extractedAliasModels } = flattenType(aliasModel.type, aliasModel.name);
      newSchemaAliasModels.push(...extractedAliasModels);
      newModelType = flattenedType;
    }
    const flattenedModel = schema.swift.createAliasModel({
      name: aliasModel.name,
      docs: aliasModel.docs,
      value: newModelType,
    });
    newSchemaAliasModels.push(flattenedModel);
  });

  documentModels.forEach(documentModel => {
    const { flattenedType, extractedAliasModels } = flattenObjectType(documentModel.type, documentModel.name);
    const flattenedModel = schema.swift.createDocumentModel({
      name: documentModel.name,
      docs: documentModel.docs,
      type: flattenedType,
    });
    newSchemaAliasModels.push(...extractedAliasModels);
    newSchemaDocumentModels.push(flattenedModel);
  });

  newSchema.addModelGroup([...newSchemaAliasModels, ...newSchemaDocumentModels]);

  return newSchema;
}
