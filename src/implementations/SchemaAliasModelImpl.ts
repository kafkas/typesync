import { definition } from '../definition';
import type { schema } from '../schema';

class SchemaAliasModelImpl implements schema.AliasModel {
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
    return definition.convertValueTypeToSchema(this.defModel.value);
  }
}

export function createSchemaAliasModel(name: string, defModel: definition.AliasModel): schema.AliasModel {
  return new SchemaAliasModelImpl(name, defModel);
}
