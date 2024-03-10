import { definition } from '../../definition';
import type { schema } from '../../schema';

export class AliasModelImpl implements schema.AliasModel {
  public constructor(
    public readonly name: string,
    private readonly defModel: definition.AliasModel
  ) {}

  public get type() {
    return this.defModel.type;
  }

  public get docs() {
    return this.defModel.docs;
  }

  public get value() {
    return definition.convertTypeToSchema(this.defModel.value);
  }
}
