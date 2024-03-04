import type { definition } from '../definition';
import type { SchemaDocumentModel, SchemaModelField } from '../interfaces';
import { createSchemaModelField } from './SchemaModelFieldImpl';

class SchemaDocumentModelImpl implements SchemaDocumentModel {
  public readonly fields: SchemaModelField[];

  public constructor(
    public readonly name: string,
    private readonly defModel: definition.DocumentModel
  ) {
    this.fields = this.getFields();
  }

  public get type() {
    return this.defModel.type;
  }

  public get docs() {
    return this.defModel.docs;
  }

  private getFields() {
    return Object.entries(this.defModel.fields).map(([fieldName, fieldJson]) => {
      return createSchemaModelField(fieldName, fieldJson);
    });
  }
}

export function createSchemaDocumentModel(name: string, defModel: definition.DocumentModel): SchemaDocumentModel {
  return new SchemaDocumentModelImpl(name, defModel);
}
