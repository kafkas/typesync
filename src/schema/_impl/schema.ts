import type { schema } from '../../schema';

export class SchemaImpl implements schema.Schema {
  public get models() {
    return Object.values(this.modelsById);
  }

  public constructor(private readonly modelsById: Record<string, schema.Model>) {}
}
