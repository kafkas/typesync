import type { types } from './types';

export interface DocumentModel {
  type: 'document';
  name: string;
  docs: string | undefined;
  fields: types.Field[];
  clone(): DocumentModel;
}

export interface AliasModel {
  type: 'alias';
  name: string;
  docs: string | undefined;
  value: types.Type;
  clone(): AliasModel;
}

export type Model = DocumentModel | AliasModel;

export interface Schema {
  aliasModels: AliasModel[];
  documentModels: DocumentModel[];
  clone(): Schema;
  addModels(...models: Model[]): void;
  addModel(model: Model): void;
  addAliasModel(model: AliasModel): void;
  addDocumentModel(model: DocumentModel): void;
}
