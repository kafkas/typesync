import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from './abstract.js';
import {
  AliasModel as AliasModelGeneric,
  DocumentModel as DocumentModelGeneric,
  Schema as SchemaGeneric,
} from './generic.js';

export interface CreateAliasModelParams<AliasParameterType> {
  name: string;
  docs: string | null;
  value: AliasParameterType;
}

export interface CreateDocumentModelParams<DocumentParameterType> {
  name: string;
  docs: string | null;
  type: DocumentParameterType;
}

export class AliasModel<AliasParameterType>
  extends AbstractAliasModel<AliasParameterType>
  implements AliasModelGeneric<AliasParameterType>
{
  public clone() {
    return new AliasModel(this.name, this.docs, this.cloneType());
  }
}

export class DocumentModel<DocumentParameterType>
  extends AbstractDocumentModel<DocumentParameterType>
  implements DocumentModelGeneric<DocumentParameterType>
{
  public clone() {
    return new DocumentModel(this.name, this.docs, this.cloneType());
  }
}

export class Schema<AliasParameterType, DocumentParameterType>
  extends AbstractSchema<AliasModel<AliasParameterType>, DocumentModel<DocumentParameterType>>
  implements SchemaGeneric<AliasModel<AliasParameterType>, DocumentModel<DocumentParameterType>>
{
  public clone() {
    return this.cloneModels(new Schema<AliasParameterType, DocumentParameterType>());
  }

  public validateType(_t: unknown) {
    // TODO: Implement
  }
}

export class SchemaFactory<AliasParameterType, DocumentParameterType> {
  public createSchema() {
    return this.createSchemaWithModels([]);
  }

  public createSchemaWithModels(models: (AliasModel<AliasParameterType> | DocumentModel<DocumentParameterType>)[]) {
    const s = new Schema<AliasParameterType, DocumentParameterType>();
    s.addModelGroup(models);
    return s;
  }

  public createAliasModel(params: CreateAliasModelParams<AliasParameterType>) {
    const { name, docs, value } = params;
    return new AliasModel(name, docs, value);
  }

  public createDocumentModel(params: CreateDocumentModelParams<DocumentParameterType>) {
    const { name, docs, type } = params;
    return new DocumentModel(name, docs, type);
  }
}
