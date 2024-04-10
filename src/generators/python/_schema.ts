import { InvalidAliasModelError, InvalidDocumentModelError } from '../../errors/invalid-model.js';
import {
  InvalidDiscriminantFieldError,
  InvalidDiscriminatedUnionAliasVariantError,
  MissingDiscriminantFieldError,
  MissingDiscriminatedUnionAliasVariantError,
} from '../../errors/invalid-schema-type.js';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from '../../schema/abstract.js';
import type {
  AliasModel,
  DiscriminatedUnionType,
  DocumentModel,
  ListType,
  MapType,
  ObjectFieldType,
  ObjectType,
  Schema,
  SimpleUnionType,
  TupleType,
} from '../../schema/generic.js';
import type { schema } from '../../schema/index.js';
import { assertNever } from '../../util/assert.js';
import { extractErrorMessage } from '../../util/extract-error-message.js';
import { noop } from '../../util/misc.js';

export type FlatType =
  | schema.types.Primitive
  | schema.types.Literal
  | FlatTupleType
  | FlatListType
  | FlatMapType
  | FlatDiscriminatedUnionType
  | FlatSimpleUnionType
  | schema.types.Alias;

export type FlatTupleType = TupleType<FlatType>;
export type FlatListType = ListType<FlatType>;
export type FlatMapType = MapType<FlatType>;
export type FlatObjectType = ObjectType<FlatType>;
export type FlatObjectFieldType = ObjectFieldType<FlatType>;
export type FlatDiscriminatedUnionType = DiscriminatedUnionType<schema.types.Alias>;
export type FlatSimpleUnionType = SimpleUnionType<FlatType>;
export type FlatAliasModel = AliasModel<FlatType | FlatObjectType | schema.types.Enum>;
export type FlatDocumentModel = DocumentModel<FlatObjectType>;
export type FlatModel = FlatAliasModel | FlatDocumentModel;
export type FlatSchema = Schema<FlatAliasModel, FlatDocumentModel>;

class FlatSchemaImpl extends AbstractSchema<FlatAliasModel, FlatDocumentModel> implements FlatSchema {
  protected validateAliasModel(model: FlatAliasModel): void {
    try {
      this.validateType(model.type);
    } catch (e) {
      const message = extractErrorMessage(e);
      throw new InvalidAliasModelError(model.name, message);
    }
  }

  protected validateDocumentModel(model: FlatDocumentModel): void {
    try {
      this.validateType(model.type);
    } catch (e) {
      const message = extractErrorMessage(e);
      throw new InvalidDocumentModelError(model.name, message);
    }
  }

  protected validateType(t: schema.types.Type): void {
    switch (t.type) {
      case 'nil':
      case 'string':
      case 'boolean':
      case 'int':
      case 'double':
      case 'timestamp':
      case 'literal':
      case 'enum':
        return noop();
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

  protected validatePrimitiveType(_: schema.types.Primitive) {
    noop();
  }

  protected validateTupleType(t: schema.types.Tuple) {
    t.values.forEach(vt => this.validateType(vt));
  }

  protected validateListType(t: schema.types.List) {
    this.validateType(t.of);
  }

  protected validateMapType(t: schema.types.Map) {
    this.validateType(t.of);
  }

  protected validateObjectType(t: schema.types.Object) {
    t.fields.forEach(field => {
      this.validateType(field.type);
    });
  }

  protected validateDiscriminatedUnionType(t: schema.types.DiscriminatedUnion) {
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

  protected validateSimpleUnionType(t: schema.types.SimpleUnion) {
    t.variants.forEach(vt => {
      this.validateType(vt);
    });
  }

  public clone() {
    return this.cloneModels(new FlatSchemaImpl());
  }
}

class FlatAliasModelImpl
  extends AbstractAliasModel<FlatType | FlatObjectType | schema.types.Enum>
  implements FlatAliasModel
{
  public clone() {
    return new FlatAliasModelImpl(this.name, this.docs, this.cloneType());
  }
}

class FlatDocumentModelImpl extends AbstractDocumentModel<FlatObjectType> implements FlatDocumentModel {
  public clone() {
    return new FlatDocumentModelImpl(this.name, this.docs, this.cloneType());
  }
}

interface CreateFlatAliasModelParams {
  name: string;
  docs: string | undefined;
  type: FlatType | FlatObjectType | schema.types.Enum;
}

export function createFlatAliasModel(params: CreateFlatAliasModelParams): FlatAliasModel {
  return new FlatAliasModelImpl(params.name, params.docs, params.type);
}

interface CreateFlatDocumentModelParams {
  name: string;
  docs: string | undefined;
  type: FlatObjectType;
}
export function createFlatDocumentModel(params: CreateFlatDocumentModelParams): FlatDocumentModel {
  return new FlatDocumentModelImpl(params.name, params.docs, params.type);
}

export function createFlatSchema(): FlatSchema {
  return new FlatSchemaImpl();
}
