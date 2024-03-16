import type { schema } from '../../schema';
import { assertNever } from '../../util/assert';

export class SchemaImpl implements schema.Schema {
  public get aliasModels() {
    return Array.from(this.aliasModelsById.values());
  }

  public get documentModels() {
    return Array.from(this.documentModelsById.values());
  }

  public constructor(
    private readonly aliasModelsById: Map<string, schema.AliasModel>,
    private readonly documentModelsById: Map<string, schema.DocumentModel>
  ) {}

  public clone() {
    const aliasModelsById = new Map(
      Array.from(this.aliasModelsById.entries()).map(([modelName, model]) => [modelName, model.clone()] as const)
    );
    const documentModelsById = new Map(
      Array.from(this.documentModelsById.entries()).map(([modelName, model]) => [modelName, model.clone()] as const)
    );
    return new SchemaImpl(aliasModelsById, documentModelsById);
  }

  public addModels(...models: schema.Model[]): void {
    models.forEach(model => {
      this.addModel(model);
    });
  }

  public addModel(model: schema.Model): void {
    switch (model.type) {
      case 'alias':
        this.addAliasModel(model);
        break;
      case 'document':
        this.addDocumentModel(model);
        break;
      default:
        assertNever(model);
    }
  }

  public addAliasModel(model: schema.AliasModel): void {
    this.validateModelNotAlreadyExists(model);
    this.aliasModelsById.set(model.name, model);
  }

  public addDocumentModel(model: schema.DocumentModel): void {
    this.validateModelNotAlreadyExists(model);
    this.documentModelsById.set(model.name, model);
  }

  private validateModelNotAlreadyExists(model: schema.Model) {
    const am = this.aliasModelsById.get(model.name);

    if (am !== undefined) {
      throw new Error(`The schema already has a '${model.name}' alias model.`);
    }

    const dm = this.documentModelsById.get(model.name);

    if (dm !== undefined) {
      throw new Error(`The schema already has a '${model.name}' document model.`);
    }
  }
}
