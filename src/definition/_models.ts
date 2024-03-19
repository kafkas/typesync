import type { types } from './types';

export interface DocumentModel {
  model: 'document';
  docs?: string;
  type: types.Object;
}

export interface AliasModel {
  model: 'alias';
  docs?: string;
  value: types.Type;
}

export type Model = DocumentModel | AliasModel;

export type Definition = Record<string, Model>;
