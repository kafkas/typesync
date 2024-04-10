import { definition } from '../definition/index.js';
import {
  InvalidDiscriminantFieldError,
  InvalidDiscriminatedUnionAliasVariantError,
  MissingDiscriminantFieldError,
  MissingDiscriminatedUnionAliasVariantError,
} from '../errors/invalid-schema.js';
import { assertNever } from '../util/assert.js';
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
    if (model.type.type === 'discriminated-union') {
      const { variants, discriminant } = model.type;
      variants.forEach((variantType, variantIdx) => {
        if (variantType.type === 'object') {
          const { fields } = variantType;
          const discriminantField = fields.find(f => f.name === discriminant);
          if (discriminantField === undefined) {
            throw new MissingDiscriminantFieldError(model.name, discriminant, variantIdx);
          }
          if (discriminantField.type.type !== 'literal' || typeof discriminantField.type.value !== 'string') {
            throw new InvalidDiscriminantFieldError(model.name, variantIdx);
          }
        } else if (variantType.type === 'alias') {
          const aliasModel = this.getAliasModel(variantType.name);
          if (aliasModel === undefined) {
            throw new MissingDiscriminatedUnionAliasVariantError(model.name, variantType.name);
          }
          if (aliasModel.type.type !== 'object') {
            throw new InvalidDiscriminatedUnionAliasVariantError(model.name, variantType.name);
          }
          const { fields } = aliasModel.type;
          const discriminantField = fields.find(f => f.name === discriminant);
          if (discriminantField === undefined) {
            throw new MissingDiscriminantFieldError(model.name, discriminant, variantType.name);
          }
          if (discriminantField.type.type !== 'literal' || typeof discriminantField.type.value !== 'string') {
            throw new InvalidDiscriminantFieldError(model.name, variantType.name);
          }
        } else {
          assertNever(variantType);
        }
      });
    }
  }

  protected validateDocumentModel(model: DocumentModel): void {
    // TODO: Implement
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
