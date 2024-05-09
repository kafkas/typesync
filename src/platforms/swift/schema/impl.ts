import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from '../../../schema-new/abstract.js';
import {
  AliasModel as AliasModelGeneric,
  DocumentModel as DocumentModelGeneric,
  Schema as SchemaGeneric,
} from '../../../schema-new/generic.js';
import type * as types from './types.js';

export type AliasParameterType = types.Type | types.Object | types.DiscriminatedUnion | types.SimpleUnion | types.Enum;

export type AliasModel = AliasModelGeneric<AliasParameterType>;

export type DocumentModel = DocumentModelGeneric<types.Object>;

export interface Schema extends SchemaGeneric<types.Type, AliasModel, DocumentModel> {}

export class SchemaImpl extends AbstractSchema<types.Type, AliasModel, DocumentModel> implements Schema {
  public clone() {
    return this.cloneModels(new SchemaImpl());
  }

  public validateType(_t: unknown) {}
}

export class AliasModelImpl extends AbstractAliasModel<AliasParameterType> implements AliasModel {
  public clone() {
    return new AliasModelImpl(this.name, this.docs, this.cloneType());
  }
}

export class DocumentModelImpl extends AbstractDocumentModel<types.Object> implements DocumentModel {
  public clone() {
    return new DocumentModelImpl(this.name, this.docs, this.cloneType());
  }
}
