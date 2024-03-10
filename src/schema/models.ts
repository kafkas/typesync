import type { Field, Type } from './types';

export interface DocumentModel {
  type: 'document';
  name: string;
  docs: string | undefined;
  fields: Field[];
}

export interface AliasModel {
  type: 'alias';
  name: string;
  docs: string | undefined;
  value: Type;
}

export type Model = DocumentModel | AliasModel;

export interface Schema {
  models: Model[];
}
