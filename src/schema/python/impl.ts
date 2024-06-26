import {
  type AliasModel as AliasModelClass,
  DocumentModel as DocumentModelClass,
  Schema as SchemaClass,
  SchemaFactory,
} from '../factory.js';
import type * as types from './types.js';

export type AliasParameterType = types.Type | types.Object | types.Enum;
export type DocumentParameterType = types.Object;

export interface AliasModel extends AliasModelClass<AliasParameterType> {}
export interface DocumentModel extends DocumentModelClass<DocumentParameterType> {}
export interface Schema
  extends SchemaClass<types.Type, AliasParameterType, DocumentParameterType, types.Object, types.DiscriminatedUnion> {}

export const { createAliasModel, createDocumentModel, createSchema, createSchemaWithModels } = new SchemaFactory<
  types.Type,
  AliasParameterType,
  DocumentParameterType,
  types.Object,
  types.DiscriminatedUnion
>();
