import type { schema } from '.';
import { converters } from '../converters';
import { definition } from '../definition';
import { assertNever } from '../util/assert';
import { AliasModelImpl } from './_impl/_alias-model';
import { DocumentModelImpl } from './_impl/_document-model';
import { SchemaImpl } from './_impl/schema';

export function create(): schema.Schema {
  return new SchemaImpl(new Map(), new Map());
}

export function createFromDefinition(def: definition.Definition): schema.Schema {
  const aliasModelsById = new Map<string, schema.AliasModel>();
  const documentModelsById = new Map<string, schema.DocumentModel>();

  Object.entries(def).forEach(([modelName, defModel]) => {
    switch (defModel.type) {
      case 'alias': {
        const schemaType = converters.definition.typeToSchema(defModel.value);
        const aliasModel = new AliasModelImpl(modelName, defModel.docs, schemaType);
        aliasModelsById.set(modelName, aliasModel);
        break;
      }
      case 'document': {
        const fieldsById = Object.fromEntries(
          Object.entries(defModel.fields).map(([fieldName, defField]) => {
            const schemaField = converters.definition.fieldToSchema(fieldName, defField);
            return [fieldName, schemaField];
          })
        );
        const documentModel = new DocumentModelImpl(modelName, defModel.docs, fieldsById);
        documentModelsById.set(modelName, documentModel);
        break;
      }
      default:
        assertNever(defModel);
    }
  });

  return new SchemaImpl(aliasModelsById, documentModelsById);
}

interface CreateAliasModelParams {
  name: string;
  docs: string | undefined;
  value: schema.types.Type;
}

export function createAliasModel(params: CreateAliasModelParams): schema.AliasModel {
  const { name, docs, value } = params;
  return new AliasModelImpl(name, docs, value);
}

interface CreateDocumentModelParams {
  name: string;
  docs: string | undefined;
  fieldsById: Record<string, schema.types.Field>;
}

export function createDocumentModel(params: CreateDocumentModelParams): schema.DocumentModel {
  const { name, docs, fieldsById } = params;
  return new DocumentModelImpl(name, docs, fieldsById);
}
