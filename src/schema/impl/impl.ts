import { converters } from '../../converters/index.js';
import { definition } from '../../definition/index.js';
import { InvalidSchemaTypeError } from '../../errors/invalid-schema-type.js';
import { assert, assertNever } from '../../util/assert.js';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from '../abstract.js';
import {
  AliasModel as AliasModelGeneric,
  DocumentModel as DocumentModelGeneric,
  Schema as SchemaGeneric,
} from '../generic.js';
import type { types } from '../types/index.js';
import { createZodSchemasForSchema } from './_zod-schemas.js';

export type AliasModel = AliasModelGeneric<types.Type>;

export type DocumentModel = DocumentModelGeneric<types.Object>;

interface ResolvedDiscriminatedUnionObjectVariant {
  type: 'object-variant';
  objectType: types.Object;
  discriminantType: types.StringLiteral;
}

interface ResolvedDiscriminatedUnionAliasVariant {
  type: 'alias-variant';
  aliasType: types.Alias;
  originalObjectType: types.Object;
  discriminantType: types.StringLiteral;
}

type ResolvedDiscriminatedUnionVariant =
  | ResolvedDiscriminatedUnionObjectVariant
  | ResolvedDiscriminatedUnionAliasVariant;

/**
 * Represents a structured model of a database schema. The `Schema` interface provides a higher-level, organized representation of the database
 * schema, facilitating easier manipulation and interaction with the Typesync generators.
 *
 * A `Schema` object is typically derived from a `Definition` but can also be created and modified imperatively when needed. It provides a clear,
 * structured format that aligns closely with development practices, making it easy to understand and utilize in generating type definitions
 * across various platforms.
 */
export interface Schema extends SchemaGeneric<types.Type, AliasModel, DocumentModel> {
  resolveDiscriminatedUnionVariants(type: types.DiscriminatedUnion): ResolvedDiscriminatedUnionVariant[];
}

class SchemaImpl extends AbstractSchema<types.Type, AliasModel, DocumentModel> implements Schema {
  private zodSchemas = createZodSchemasForSchema(this);

  public clone() {
    return this.cloneModels(new SchemaImpl());
  }

  public resolveDiscriminatedUnionVariants(t: types.DiscriminatedUnion) {
    return t.variants.map((variant): ResolvedDiscriminatedUnionVariant => {
      if (variant.type === 'object') {
        const { fields } = variant;
        const discriminantField = fields.find(f => f.name === t.discriminant);
        assert(discriminantField?.type.type === 'string-literal');
        return {
          type: 'object-variant',
          objectType: variant,
          discriminantType: discriminantField.type,
        };
      } else if (variant.type === 'alias') {
        const aliasModel = this.getAliasModel(variant.name);
        assert(aliasModel?.type.type === 'object');
        const discriminantField = aliasModel.type.fields.find(f => f.name === t.discriminant);
        assert(discriminantField?.type.type === 'string-literal');
        return {
          type: 'alias-variant',
          aliasType: variant,
          originalObjectType: aliasModel.type,
          discriminantType: discriminantField.type,
        };
      } else {
        assertNever(variant);
      }
    });
  }

  public validateType(t: unknown) {
    const { type } = this.zodSchemas;
    const parseRes = type.safeParse(t);
    if (!parseRes.success) {
      const { error } = parseRes;
      const [issue] = error.issues;
      if (issue) {
        const { message } = issue;
        throw new InvalidSchemaTypeError(message);
      } else {
        throw new InvalidSchemaTypeError('Cannot parse type due to an unexpected error.');
      }
    }
    return parseRes.data;
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

/**
 * Creates a new Typesync schema.
 */
export function createSchema(): Schema {
  return createSchemaWithModels([]);
}

/**
 * Creates a new Typesync schema from the specified definition.
 */
export function createSchemaFromDefinition(def: definition.Definition): Schema {
  const models = Object.entries(def).map(([modelName, defModel]) => {
    switch (defModel.model) {
      case 'alias': {
        const schemaType = converters.definition.typeToSchema(defModel.type);
        return new AliasModelImpl(modelName, defModel.docs ?? null, schemaType);
      }
      case 'document': {
        const schemaType = converters.definition.objectTypeToSchema(defModel.type);
        return new DocumentModelImpl(modelName, defModel.docs ?? null, schemaType);
      }
      default:
        assertNever(defModel);
    }
  });

  return createSchemaWithModels(models);
}

/**
 * Creates a new Typesync schema with the specified models.
 */
export function createSchemaWithModels(models: (AliasModel | DocumentModel)[]): Schema {
  const s = new SchemaImpl();
  s.addModelGroup(models);
  return s;
}

interface CreateAliasModelParams {
  name: string;
  docs: string | null;
  value: types.Type;
}

export function createAliasModel(params: CreateAliasModelParams): AliasModel {
  const { name, docs, value } = params;
  return new AliasModelImpl(name, docs, value);
}

interface CreateDocumentModelParams {
  name: string;
  docs: string | null;
  type: types.Object;
}

export function createDocumentModel(params: CreateDocumentModelParams): DocumentModel {
  const { name, docs, type } = params;
  return new DocumentModelImpl(name, docs, type);
}
