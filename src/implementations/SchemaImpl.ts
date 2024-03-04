import type { definition } from '../definition';
import type { schema } from '../interfaces';
import { createSchemaDocumentModel } from './SchemaDocumentModelImpl';
import { createSchemaAliasModel } from './SchemaAliasModelImpl';
import { assertNever } from '../util/assert';

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
