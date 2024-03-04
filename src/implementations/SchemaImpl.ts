import type { definition } from '../definition';
import type { Schema, SchemaModel } from '../interfaces';
import { createSchemaDocumentModel } from './SchemaDocumentModelImpl';
import { createSchemaAliasModel } from './SchemaAliasModelImpl';
import { assertNever } from '../util/assert';

class SchemaImpl implements Schema {
  public readonly models: SchemaModel[];

  public constructor(private readonly def: definition.Definition) {
    this.models = this.getModels();
  }

  private getModels() {
    return Object.entries(this.def).map(([modelName, model]) => {
      switch (model.type) {
        case 'document':
          return createSchemaDocumentModel(modelName, model);
        case 'alias':
          return createSchemaAliasModel(modelName, model);
        default:
          assertNever(model);
      }
    });
  }
}

export function createSchema(def: definition.Definition): Schema {
  return new SchemaImpl(def);
}
