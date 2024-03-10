import type { definition } from '../../definition';
import type { schema } from '../../schema';
import { assertNever } from '../../util/assert';
import { AliasModelImpl } from './_alias-model';
import { DocumentModelImpl } from './_document-model';

export class SchemaImpl implements schema.Schema {
  public readonly models: schema.Model[];

  public constructor(private readonly def: definition.Definition) {
    this.models = this.getModels();
  }

  private getModels() {
    return Object.entries(this.def).map(([modelName, model]) => {
      switch (model.type) {
        case 'document':
          return new DocumentModelImpl(modelName, model);
        case 'alias':
          return new AliasModelImpl(modelName, model);
        default:
          assertNever(model);
      }
    });
  }
}
