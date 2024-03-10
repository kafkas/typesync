import type { types } from './types';

export interface DocumentModel {
  type: 'document';
  name: string;
  docs: string | undefined;
  fields: types.Field[];
}

export interface AliasModel {
  type: 'alias';
  name: string;
  docs: string | undefined;
  value: types.Type;
}

export type Model = DocumentModel | AliasModel;

export interface Schema {
  models: Model[];
}
