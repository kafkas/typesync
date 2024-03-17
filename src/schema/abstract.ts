import { cloneDeep } from 'lodash';

import { assertNever } from '../util/assert';
import type { AliasModel, DocumentModel, FieldType } from './generic';

export abstract class AbstractAliasModel<T> {
  public readonly type = 'alias';

  public constructor(
    public readonly name: string,
    public readonly docs: string | undefined,
    public readonly value: T
  ) {}

  protected cloneValue() {
    return cloneDeep(this.value);
  }
}

export abstract class AbstractDocumentModel<F extends FieldType<unknown>> {
  public readonly type = 'document';

  public get fields() {
    return Object.values(this.fieldsById);
  }

  public constructor(
    public readonly name: string,
    public readonly docs: string | undefined,
    protected readonly fieldsById: Record<string, F>
  ) {}

  protected cloneFieldsById() {
    return cloneDeep(this.fieldsById);
  }
}

export abstract class AbstractSchema<
  A extends AliasModel<unknown>,
  D extends DocumentModel<unknown, FieldType<unknown>>,
> {
  public get aliasModels() {
    return Array.from(this.aliasModelsById.values());
  }

  public get documentModels() {
    return Array.from(this.documentModelsById.values());
  }

  public constructor(
    protected readonly aliasModelsById: Map<string, A>,
    protected readonly documentModelsById: Map<string, D>
  ) {}

  protected cloneMaps() {
    const aliasModelsById = new Map(
      Array.from(this.aliasModelsById.entries()).map(([modelName, model]) => [modelName, model.clone() as A])
    );
    const documentModelsById = new Map(
      Array.from(this.documentModelsById.entries()).map(([modelName, model]) => [modelName, model.clone() as D])
    );
    return { aliasModelsById, documentModelsById };
  }

  public addModels(...models: (A | D)[]): void {
    models.forEach(model => {
      this.addModel(model);
    });
  }

  public addModel(model: A | D): void {
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

  public addAliasModel(model: A): void {
    this.validateModelNotAlreadyExists(model);
    this.aliasModelsById.set(model.name, model);
  }

  public addDocumentModel(model: D): void {
    this.validateModelNotAlreadyExists(model);
    this.documentModelsById.set(model.name, model);
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
}
