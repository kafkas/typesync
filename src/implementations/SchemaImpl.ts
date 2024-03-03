import type { Definition } from '../definition';
import type { Schema, SchemaModel } from '../interfaces';
import { createSchemaDocumentModel } from './SchemaDocumentModelImpl';
import { createSchemaAliasModel } from './SchemaAliasModelImpl';

class SchemaImpl implements Schema {
  public readonly models: SchemaModel[];

  public constructor(private readonly definition: Definition) {
    this.models = this.getModels();
  }

  private getModels() {
    return Object.entries(this.definition).map(([modelName, model]) => {
      switch (model.type) {
        case 'document':
          return createSchemaDocumentModel(modelName, model);
        case 'alias':
          return createSchemaAliasModel(modelName, model);
      }
    });
  }
}

export function createSchema(definition: Definition): Schema {
  return new SchemaImpl(definition);
}
