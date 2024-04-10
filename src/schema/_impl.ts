import { definition } from '../definition/index.js';
import { InvalidAliasModelError, InvalidDocumentModelError } from '../errors/invalid-model.js';
import {
  InvalidDiscriminantFieldError,
  InvalidDiscriminatedUnionAliasVariantError,
  MissingDiscriminantFieldError,
  MissingDiscriminatedUnionAliasVariantError,
} from '../errors/invalid-schema-type.js';
import { assertNever } from '../util/assert.js';
import { extractErrorMessage } from '../util/extract-error-message.js';
import { noop } from '../util/misc.js';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from './abstract.js';
import {
  AliasModel as AliasModelGeneric,
  DocumentModel as DocumentModelGeneric,
  Schema as SchemaGeneric,
} from './generic.js';
import { schema } from './index.js';
import type { types } from './types/index.js';

export type AliasModel = AliasModelGeneric<types.Type>;

export type DocumentModel = DocumentModelGeneric<types.Object>;

export type Schema = SchemaGeneric<AliasModel, DocumentModel>;

class SchemaImpl extends AbstractSchema<AliasModel, DocumentModel> implements Schema {
  protected validateAliasModel(model: AliasModel): void {
    try {
      this.validateType(model.type);
    } catch (e) {
      const message = extractErrorMessage(e);
      throw new InvalidAliasModelError(model.name, message);
    }
  }

  protected validateDocumentModel(model: DocumentModel): void {
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
    return this.cloneModels(new SchemaImpl());
  }
}

class AliasModelImpl extends AbstractAliasModel<types.Type> implements AliasModel {
  public clone() {
    return new AliasModelImpl(this.name, this.docs, this.cloneType());
  }
}

class DocumentModelImpl extends AbstractDocumentModel<types.Object> implements DocumentModel {
  public clone() {
    return new DocumentModelImpl(this.name, this.docs, this.cloneType());
  }
}

export function create(): schema.Schema {
  return createFromDefinition({});
}

export function createFromDefinition(def: definition.Definition): schema.Schema {
  const s = new SchemaImpl();

  Object.entries(def).forEach(([modelName, defModel]) => {
    switch (defModel.model) {
      case 'alias': {
        const schemaType = definition.convert.typeToSchema(defModel.type);
        const aliasModel = new AliasModelImpl(modelName, defModel.docs, schemaType);
        s.addAliasModel(aliasModel);
        break;
      }
      case 'document': {
        const schemaType = definition.convert.objectTypeToSchema(defModel.type);
        const documentModel = new DocumentModelImpl(modelName, defModel.docs, schemaType);
        s.addDocumentModel(documentModel);
        break;
      }
      default:
        assertNever(defModel);
    }
  });

  return s;
}

interface CreateAliasModelParams {
  name: string;
  docs: string | undefined;
  value: schema.types.Type;
}

export function createAliasModel(params: CreateAliasModelParams): schema.AliasModel {
  const { name, docs, value } = params;
  return new AliasModelImpl(name, docs, value);
}

interface CreateDocumentModelParams {
  name: string;
  docs: string | undefined;
  type: schema.types.Object;
}

export function createDocumentModel(params: CreateDocumentModelParams): schema.DocumentModel {
  const { name, docs, type } = params;
  return new DocumentModelImpl(name, docs, type);
}
