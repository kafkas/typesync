import type { types } from './types';

export interface DocumentModel {
  model: 'document';
  docs?: string;
  fields: Record<string, types.ObjectField>;
}

export interface AliasModel {
  model: 'alias';
  docs?: string;
  value: types.Type;
}

export type Model = DocumentModel | AliasModel;

export type Definition = Record<string, Model>;
