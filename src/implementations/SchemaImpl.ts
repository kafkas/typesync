import type { Schema, SchemaJson, SchemaModel } from '../interfaces';
import { createSchemaModel } from './SchemaModelImpl';

class SchemaImpl implements Schema {
  public readonly models: SchemaModel[];

  public constructor(private readonly schemaJson: SchemaJson) {
    this.models = this.getModels();
  }

  private getModels() {
    return Object.entries(this.schemaJson.models).map(([modelName, modelJson]) => {
      return createSchemaModel(modelName, modelJson);
    });
  }
}

export function createSchema(schemaJson: SchemaJson): Schema {
  return new SchemaImpl(schemaJson);
}
