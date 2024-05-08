import { AliasModel, AliasModelImpl, DocumentModel, DocumentModelImpl, Schema, SchemaImpl } from './impl.js';
import type * as types from './types.js';

export function createSchema(): Schema {
  return createSchemaWithModels([]);
}

export function createSchemaWithModels(models: (AliasModel | DocumentModel)[]): Schema {
  const s = new SchemaImpl();
  s.addModelGroup(models);
  return s;
}

interface CreateAliasModelParams {
  name: string;
  docs: string | null;
  value: types.Type | types.Object | types.Enum;
}

export function createAliasModel(params: CreateAliasModelParams): AliasModel {
  const { name, docs, value } = params;
  return new AliasModelImpl(name, docs, value);
}

interface CreateDocumentModelParams {
  name: string;
  docs: string | null;
  type: types.Object;
}

export function createDocumentModel(params: CreateDocumentModelParams): DocumentModel {
  const { name, docs, type } = params;
  return new DocumentModelImpl(name, docs, type);
}
