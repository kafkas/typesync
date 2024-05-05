import lodash from 'lodash';

import { DuplicateModelError, InvalidModelError } from '../errors/invalid-model.js';
import {
  DuplicateEnumMemberLabelError,
  DuplicateEnumMemberValueError,
  InvalidDiscriminantFieldError,
  InvalidDiscriminatedUnionAliasVariantError,
  MissingDiscriminantFieldError,
  MissingDiscriminatedUnionAliasVariantError,
  NoEnumMembersError,
} from '../errors/invalid-schema-type.js';
import { assertNever } from '../util/assert.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import { getDuplicateElements } from '../util/list.js';
import { noop } from '../util/misc.js';
import type { AliasModel, DocumentModel } from './generic.js';
import type { schema } from './index.js';

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

export abstract class AbstractSchema<
  A extends AliasModel<schema.types.Type>,
  D extends DocumentModel<schema.types.Type>,
> {
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

  protected cloneModels<S extends AbstractSchema<A, D>>(toSchema: S) {
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

  private validateType(t: schema.types.Type): void {
    switch (t.type) {
      case 'unknown':
      case 'nil':
      case 'string':
      case 'boolean':
      case 'int':
      case 'double':
      case 'timestamp':
      case 'literal':
        return noop();
      case 'enum':
        return this.validateEnumType(t);
      case 'tuple':
        return this.validateTupleType(t);
      case 'list':
        return this.validateListType(t);
      case 'map':
        return this.validateMapType(t);
      case 'object':
        return this.validateObjectType(t);
      case 'discriminated-union':
        return this.validateDiscriminatedUnionType(t);
      case 'simple-union':
        return this.validateSimpleUnionType(t);
      case 'alias':
        return noop();
      default:
        assertNever(t);
    }
  }

  private validateEnumType(t: schema.types.Enum) {
    if (t.members.length === 0) {
      throw new NoEnumMembersError();
    }
    const labels = t.members.map(member => member.label);
    const values = t.members.map(member => member.value);
    const [duplicateLabel] = getDuplicateElements(labels);
    const [duplicateValue] = getDuplicateElements(values);
    if (duplicateLabel !== undefined) {
      throw new DuplicateEnumMemberLabelError(duplicateLabel);
    }
    if (duplicateValue !== undefined) {
      throw new DuplicateEnumMemberValueError(duplicateValue);
    }
  }

  private validateTupleType(t: schema.types.Tuple) {
    t.elements.forEach(vt => this.validateType(vt));
  }

  private validateListType(t: schema.types.List) {
    this.validateType(t.elementType);
  }

  private validateMapType(t: schema.types.Map) {
    this.validateType(t.valueType);
  }

  private validateObjectType(t: schema.types.Object) {
    t.fields.forEach(field => {
      this.validateType(field.type);
    });
  }

  private validateDiscriminatedUnionType(t: schema.types.DiscriminatedUnion) {
    const { variants, discriminant } = t;
    variants.forEach((variantType, variantIdx) => {
      if (variantType.type === 'object') {
        this.validateObjectType(variantType);
        const { fields } = variantType;
        const discriminantField = fields.find(f => f.name === discriminant);
        if (discriminantField === undefined) {
          throw new MissingDiscriminantFieldError(discriminant, variantIdx);
        }
        if (discriminantField.type.type !== 'literal' || typeof discriminantField.type.value !== 'string') {
          throw new InvalidDiscriminantFieldError(variantIdx);
        }
      } else if (variantType.type === 'alias') {
        const aliasModel = this.getAliasModel(variantType.name);
        if (aliasModel === undefined) {
          throw new MissingDiscriminatedUnionAliasVariantError(variantType.name);
        }
        if (aliasModel.type.type !== 'object') {
          throw new InvalidDiscriminatedUnionAliasVariantError(variantType.name);
        }
        const { fields } = aliasModel.type;
        const discriminantField = fields.find(f => f.name === discriminant);
        if (discriminantField === undefined) {
          throw new MissingDiscriminantFieldError(discriminant, variantType.name);
        }
        if (discriminantField.type.type !== 'literal' || typeof discriminantField.type.value !== 'string') {
          throw new InvalidDiscriminantFieldError(variantType.name);
        }
      } else {
        assertNever(variantType);
      }
    });
  }

  private validateSimpleUnionType(t: schema.types.SimpleUnion) {
    t.variants.forEach(vt => {
      this.validateType(vt);
    });
  }
}
