import type { types } from './types';

export interface DocumentModel {
  type: 'document';
  docs?: string;
  fields: Record<string, types.Field>;
}

export interface AliasModel {
  type: 'alias';
  docs?: string;
  value: types.Type;
}

export type Model = DocumentModel | AliasModel;

export type Definition = Record<string, Model>;
