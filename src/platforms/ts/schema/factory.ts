import {
  AliasModel,
  AliasModelImpl,
  AliasParameterType,
  DocumentModel,
  DocumentModelImpl,
  DocumentParameterType,
  Schema,
  SchemaImpl,
} from './impl.js';

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
  value: AliasParameterType;
}

export function createAliasModel(params: CreateAliasModelParams): AliasModel {
  const { name, docs, value } = params;
  return new AliasModelImpl(name, docs, value);
}

interface CreateDocumentModelParams {
  name: string;
  docs: string | null;
  type: DocumentParameterType;
}

export function createDocumentModel(params: CreateDocumentModelParams): DocumentModel {
  const { name, docs, type } = params;
  return new DocumentModelImpl(name, docs, type);
}
