import type { definition } from '../../definition';
import type { schema } from '../../schema';
import { FieldImpl } from './_field';

export class DocumentModelImpl implements schema.DocumentModel {
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
      return new FieldImpl(fieldName, fieldJson);
    });
  }
}
