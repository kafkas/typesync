import type { schema } from '.';
import { definition } from '../definition';
import { assertNever } from '../util/assert';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from './abstract';
import {
  AliasModel as AliasModelGeneric,
  DocumentModel as DocumentModelGeneric,
  Schema as SchemaGeneric,
} from './generic';
import type { types } from './types';

export type AliasModel = AliasModelGeneric<types.Type>;

export type DocumentModel = DocumentModelGeneric<types.Type, types.ObjectField>;

export type Schema = SchemaGeneric<AliasModel, DocumentModel>;

class SchemaImpl extends AbstractSchema<AliasModel, DocumentModel> implements Schema {
  public clone() {
    const { aliasModelsById, documentModelsById } = this.cloneMaps();
    return new SchemaImpl(aliasModelsById, documentModelsById);
  }
}

class AliasModelImpl extends AbstractAliasModel<types.Type> implements AliasModel {
  public clone() {
    return new AliasModelImpl(this.name, this.docs, this.cloneValue());
  }
}

class DocumentModelImpl extends AbstractDocumentModel<types.ObjectField> implements DocumentModel {
  public clone() {
    return new DocumentModelImpl(this.name, this.docs, this.cloneFieldsById());
  }
}

export function createSchema(def?: definition.Definition): schema.Schema {
  const aliasModelsById = new Map<string, schema.AliasModel>();
  const documentModelsById = new Map<string, schema.DocumentModel>();

  if (def) {
    Object.entries(def).forEach(([modelName, defModel]) => {
      switch (defModel.type) {
        case 'alias': {
          const schemaType = definition.convert.typeToSchema(defModel.value);
          const aliasModel = new AliasModelImpl(modelName, defModel.docs, schemaType);
          aliasModelsById.set(modelName, aliasModel);
          break;
        }
        case 'document': {
          const fieldsById = Object.fromEntries(
            Object.entries(defModel.fields).map(([fieldName, defField]) => {
              const schemaField = definition.convert.fieldToSchema(fieldName, defField);
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
  }

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
  fieldsById: Record<string, schema.types.ObjectField>;
}

export function createDocumentModel(params: CreateDocumentModelParams): schema.DocumentModel {
  const { name, docs, fieldsById } = params;
  return new DocumentModelImpl(name, docs, fieldsById);
}
