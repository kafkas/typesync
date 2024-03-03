import type { SchemaModel, SchemaModelField, SchemaModelJson } from '../interfaces';
import { createSchemaModelField } from './SchemaModelFieldImpl';

class SchemaModelImpl implements SchemaModel {
  public readonly fields: SchemaModelField[];

  public constructor(
    public readonly name: string,
    private readonly modelJson: SchemaModelJson
  ) {
    this.fields = this.getFields();
  }

  public get docs() {
    return this.modelJson.docs;
  }

  private getFields() {
    return Object.entries(this.modelJson.fields).map(([fieldName, fieldJson]) => {
      return createSchemaModelField(fieldName, fieldJson);
    });
  }
}

export function createSchemaModel(name: string, modelJson: SchemaModelJson): SchemaModel {
  return new SchemaModelImpl(name, modelJson);
}
