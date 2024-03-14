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
  models: Model[];
  clone(): Schema;
}
