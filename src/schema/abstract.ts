import lodash from 'lodash';

import { DuplicateModelError, InvalidModelError } from '../errors/invalid-model.js';
import { assertNever } from '../util/assert.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import type { AliasModel, DocumentModel } from './generic.js';

export abstract class AbstractAliasModel<T> {
  public readonly model = 'alias';

  public constructor(
    public readonly name: string,
    public readonly docs: string | null,
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
    public readonly docs: string | null,
    public readonly type: T
  ) {}

  protected cloneType() {
    return lodash.cloneDeep(this.type);
  }
}

export abstract class AbstractSchema<T, A extends AliasModel<unknown>, D extends DocumentModel<unknown>> {
  private readonly aliasModelsById: Map<string, A>;
  private readonly documentModelsById: Map<string, D>;

  public get aliasModels() {
    return Array.from(this.aliasModelsById.values()).sort((m1, m2) => m1.name.localeCompare(m2.name));
  }

  public get documentModels() {
    return Array.from(this.documentModelsById.values()).sort((m1, m2) => m1.name.localeCompare(m2.name));
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
      this.validateModel(model);
    });
  }

  public addModel(model: A | D): void {
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
    this.validateModel(model);
  }

  public getAliasModel(modelName: string) {
    return this.aliasModelsById.get(modelName);
  }

  protected cloneModels<S extends AbstractSchema<T, A, D>>(toSchema: S) {
    const aliasModelClones = Array.from(this.aliasModelsById.values()).map(m => m.clone() as A);
    const documentModelClones = Array.from(this.documentModels.values()).map(m => m.clone() as D);
    toSchema.addModelGroup([...aliasModelClones, ...documentModelClones]);
    return toSchema;
  }

  private validateModelNotAlreadyExists(model: A | D) {
    const am = this.aliasModelsById.get(model.name);
    const dm = this.documentModelsById.get(model.name);
    if (am !== undefined || dm !== undefined) {
      throw new DuplicateModelError(model.name);
    }
  }

  private validateModel(model: A | D): void {
    try {
      this.validateType(model.type);
    } catch (e) {
      const message = extractErrorMessage(e);
      throw new InvalidModelError(model.name, message);
    }
  }

  protected abstract validateType(type: unknown): void;
}
