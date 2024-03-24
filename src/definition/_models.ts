import type { types } from './types/index.js';

export interface AliasModel {
  model: 'alias';
  docs?: string;
  type: types.Type;
}

export interface DocumentModel {
  model: 'document';
  docs?: string;
  type: types.Object;
}

export type Model = AliasModel | DocumentModel;

export type Definition = Record<string, Model>;
