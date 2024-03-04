import type { definition } from '../definition';
import type { SchemaAliasModel } from '../interfaces';
import { convertDefValueTypeToSchemaValueType } from './converters';

class SchemaAliasModelImpl implements SchemaAliasModel {
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
    return convertDefValueTypeToSchemaValueType(this.defModel.value);
  }
}

export function createSchemaAliasModel(name: string, defModel: definition.AliasModel): SchemaAliasModel {
  return new SchemaAliasModelImpl(name, defModel);
}
