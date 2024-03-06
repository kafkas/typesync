import type { definition } from '../definition';
import type { schema } from '../interfaces';
import { assertNever } from '../util/assert';
import { createSchemaAliasModel } from './SchemaAliasModelImpl';
import { createSchemaDocumentModel } from './SchemaDocumentModelImpl';

class SchemaImpl implements schema.Schema {
  public readonly models: schema.Model[];

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

export function createSchema(def: definition.Definition): schema.Schema {
  return new SchemaImpl(def);
}
