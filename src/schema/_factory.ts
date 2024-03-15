import type { schema } from '.';
import { definition } from '../definition';
import { assertNever } from '../util/assert';
import { AliasModelImpl } from './_impl/_alias-model';
import { DocumentModelImpl } from './_impl/_document-model';
import { SchemaImpl } from './_impl/schema';
import type { Schema } from './_models';

export function create(): Schema {
  return new SchemaImpl(new Map(), new Map());
}

export function createFromDefinition(def: definition.Definition): Schema {
  const aliasModelsById = new Map<string, schema.AliasModel>();
  const documentModelsById = new Map<string, schema.DocumentModel>();

  Object.entries(def).forEach(([modelName, defModel]) => {
    switch (defModel.type) {
      case 'alias': {
        const aliasModel = new AliasModelImpl(modelName, defModel.docs, definition.convertTypeToSchema(defModel.value));
        aliasModelsById.set(modelName, aliasModel);
        break;
      }
      case 'document': {
        const fieldsById = Object.fromEntries(
          Object.entries(defModel.fields).map(([fieldName, defField]) => {
            return [fieldName, definition.convertFieldToSchema(fieldName, defField)];
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

export function createAliasModel(params: CreateAliasModelParams) {
  const { name, docs, value } = params;
  return new AliasModelImpl(name, docs, value);
}

interface CreateDocumentModelParams {
  name: string;
  docs: string | undefined;
  fieldsById: Record<string, schema.types.Field>;
}

export function createDocumentModel(params: CreateDocumentModelParams) {
  const { name, docs, fieldsById } = params;
  return new DocumentModelImpl(name, docs, fieldsById);
}
