import type { SchemaAliasModel, DefAliasModel } from '../interfaces';
import { convertDefValueTypeToSchemaValueType } from './converters';

class SchemaAliasModelImpl implements SchemaAliasModel {
  public constructor(
    public readonly name: string,
    private readonly defModel: DefAliasModel
  ) {}

  public get type() {
    return this.defModel.type;
  }

  public get docs() {
    return this.defModel.docs;
  }

  public get value() {
    return convertDefValueTypeToSchemaValueType(this.defModel.value);
  }
}

export function createSchemaAliasModel(name: string, defModel: DefAliasModel): SchemaAliasModel {
  return new SchemaAliasModelImpl(name, defModel);
}
