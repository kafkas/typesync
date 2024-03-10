import type { definition } from '../definition';
import type { schema } from '../schema';
import { createSchemaModelField } from './SchemaModelFieldImpl';

class SchemaDocumentModelImpl implements schema.DocumentModel {
  public readonly fields: schema.types.Field[];

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

export function createSchemaDocumentModel(name: string, defModel: definition.DocumentModel): schema.DocumentModel {
  return new SchemaDocumentModelImpl(name, defModel);
}
