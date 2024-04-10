import lodash from 'lodash';

import { assertNever } from '../util/assert.js';
import type { AliasModel, DocumentModel } from './generic.js';

export abstract class AbstractAliasModel<T> {
  public readonly model = 'alias';

  public constructor(
    public readonly name: string,
    public readonly docs: string | undefined,
    public readonly type: T
  ) {}

  protected cloneType() {
    return lodash.cloneDeep(this.type);
  }
}

export abstract class AbstractDocumentModel<T> {
  public readonly model = 'document';

  public constructor(
    public readonly name: string,
    public readonly docs: string | undefined,
    public readonly type: T
  ) {}

  protected cloneType() {
    return lodash.cloneDeep(this.type);
  }
}

export abstract class AbstractSchema<A extends AliasModel<unknown>, D extends DocumentModel<unknown>> {
  protected readonly aliasModelsById: Map<string, A>;
  protected readonly documentModelsById: Map<string, D>;

  protected abstract validateAliasModel(model: A): void;
  protected abstract validateDocumentModel(model: D): void;

  public get aliasModels() {
    return Array.from(this.aliasModelsById.values());
  }

  public get documentModels() {
    return Array.from(this.documentModelsById.values());
  }

  public constructor() {
    this.aliasModelsById = new Map();
    this.documentModelsById = new Map();
  }

  public addModelGroup(models: (A | D)[]): void {
    models.forEach(model => {
      this.validateModelNotAlreadyExists(model);
      switch (model.model) {
        case 'alias':
          this.aliasModelsById.set(model.name, model);
          break;
        case 'document':
          this.documentModelsById.set(model.name, model);
          break;
        default:
          assertNever(model);
      }
    });

    models.forEach(model => {
      switch (model.model) {
        case 'alias':
          this.validateAliasModel(model);
          break;
        case 'document':
          this.validateDocumentModel(model);
          break;
        default:
          assertNever(model);
      }
    });
  }

  public addModel(model: A | D): void {
    switch (model.model) {
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

  public addAliasModel(model: A): void {
    this.validateModelNotAlreadyExists(model);
    this.aliasModelsById.set(model.name, model);
    this.validateAliasModel(model);
  }

  public addDocumentModel(model: D): void {
    this.validateModelNotAlreadyExists(model);
    this.documentModelsById.set(model.name, model);
    this.validateDocumentModel(model);
  }

  protected getAliasModel(modelName: string) {
    return this.aliasModelsById.get(modelName);
  }

  private validateModelNotAlreadyExists(model: A | D) {
    const am = this.aliasModelsById.get(model.name);

    if (am !== undefined) {
      throw new Error(`The schema already has a '${model.name}' alias model.`);
    }

    const dm = this.documentModelsById.get(model.name);

    if (dm !== undefined) {
      throw new Error(`The schema already has a '${model.name}' document model.`);
    }
  }

  protected cloneModels<S extends AbstractSchema<A, D>>(toSchema: S) {
    const aliasModelsById = new Map(
      Array.from(this.aliasModelsById.entries()).map(([modelName, model]) => [modelName, model.clone() as A])
    );
    const documentModelsById = new Map(
      Array.from(this.documentModelsById.entries()).map(([modelName, model]) => [modelName, model.clone() as D])
    );
    aliasModelsById.forEach(model => {
      toSchema.addAliasModel(model);
    });
    documentModelsById.forEach(model => {
      toSchema.addDocumentModel(model);
    });
    return toSchema;
  }
}
