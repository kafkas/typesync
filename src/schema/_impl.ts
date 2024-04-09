import { definition } from '../definition/index.js';
import { assertNever } from '../util/assert.js';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from './abstract.js';
import {
  AliasModel as AliasModelGeneric,
  DocumentModel as DocumentModelGeneric,
  Schema as SchemaGeneric,
} from './generic.js';
import { schema } from './index.js';
import type { types } from './types/index.js';

export type AliasModel = AliasModelGeneric<types.Type>;

export type DocumentModel = DocumentModelGeneric<types.Object>;

export type Schema = SchemaGeneric<AliasModel, DocumentModel>;

class SchemaImpl extends AbstractSchema<AliasModel, DocumentModel> implements Schema {
  public clone() {
    return this.cloneModels(new SchemaImpl());
  }
}

class AliasModelImpl extends AbstractAliasModel<types.Type> implements AliasModel {
  public clone() {
    return new AliasModelImpl(this.name, this.docs, this.cloneType());
  }
}

class DocumentModelImpl extends AbstractDocumentModel<types.Object> implements DocumentModel {
  public clone() {
    return new DocumentModelImpl(this.name, this.docs, this.cloneType());
  }
}

export function create(): schema.Schema {
  return createFromDefinition({});
}

export function createFromDefinition(def: definition.Definition): schema.Schema {
  const s = new SchemaImpl();

  Object.entries(def).forEach(([modelName, defModel]) => {
    switch (defModel.model) {
      case 'alias': {
        const schemaType = definition.convert.typeToSchema(defModel.type);
        const aliasModel = new AliasModelImpl(modelName, defModel.docs, schemaType);
        s.addAliasModel(aliasModel);
        break;
      }
      case 'document': {
        const schemaType = definition.convert.objectTypeToSchema(defModel.type);
        const documentModel = new DocumentModelImpl(modelName, defModel.docs, schemaType);
        s.addDocumentModel(documentModel);
        break;
      }
      default:
        assertNever(defModel);
    }
  });

  return s;
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
  type: schema.types.Object;
}

export function createDocumentModel(params: CreateDocumentModelParams): schema.DocumentModel {
  const { name, docs, type } = params;
  return new DocumentModelImpl(name, docs, type);
}
