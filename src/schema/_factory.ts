import { schema } from '.';
import { definition } from '../definition';
import { assertNever } from '../util/assert';
import { AliasModelImpl } from './_impl/_alias-model';
import { DocumentModelImpl } from './_impl/_document-model';
import { SchemaImpl } from './_impl/schema';
import type { Model, Schema } from './_models';

export function create(): Schema {
  return new SchemaImpl({});
}

export function createFromDefinition(def: definition.Definition): Schema {
  const modelsById = Object.fromEntries(
    Object.entries(def).map(([modelName, defModel]): [string, Model] => {
      switch (defModel.type) {
        case 'document': {
          const fieldsById = Object.fromEntries(
            Object.entries(defModel.fields).map(([fieldName, defField]) => {
              return [fieldName, definition.convertFieldToSchema(fieldName, defField)];
            })
          );
          return [modelName, new DocumentModelImpl(modelName, defModel.docs, fieldsById)];
        }
        case 'alias':
          return [
            modelName,
            new AliasModelImpl(modelName, defModel.docs, definition.convertTypeToSchema(defModel.value)),
          ];
        default:
          assertNever(defModel);
      }
    })
  );
  return new SchemaImpl(modelsById);
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
