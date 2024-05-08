import type { types } from '../types/index.js';

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

/**
 * Provides a raw representation of the user-defined database schema. A `Definition` object is created by parsing and aggregating the models
 * declared in schema definition files into a plain object keyed by model names.
 *
 * The `Definition` interface acts as the initial parsed version of the schema, directly reflecting the user inputs with minimal transformation.
 * It serves as the foundational data structure from which the more structured `Schema` object is derived.
 * */
export type Definition = Record<string, Model>;
