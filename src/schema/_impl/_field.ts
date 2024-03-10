import { definition } from '../../definition';
import type { schema } from '../../schema';

export class FieldImpl implements schema.types.Field {
  public constructor(
    public readonly name: string,
    private readonly defModelField: definition.types.Field
  ) {}

  public get type() {
    return definition.convertTypeToSchema(this.defModelField.type);
  }

  public get optional() {
    return !!this.defModelField.optional;
  }

  public get docs() {
    return this.defModelField.docs;
  }
}
