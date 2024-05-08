import { converters } from '../converters/index.js';
import { definition } from '../definition-new/index.js';
import { InvalidSchemaTypeError } from '../errors/invalid-schema-type.js';
import { assertNever } from '../util/assert.js';
import { AbstractAliasModel, AbstractDocumentModel, AbstractSchema } from './abstract.js';
import {
  AliasModel as AliasModelGeneric,
  DocumentModel as DocumentModelGeneric,
  Schema as SchemaGeneric,
} from './generic.js';
import type { types } from './types/index.js';
import { schemaParsers } from './types/zod-schemas.js';

export type AliasModel = AliasModelGeneric<types.Type>;

export type DocumentModel = DocumentModelGeneric<types.Object>;

/**
 * Represents a structured model of a database schema. The `Schema` interface provides a higher-level, organized representation of the database
 * schema, facilitating easier manipulation and interaction with the Typesync generators.
 *
 * A `Schema` object is typically derived from a `Definition` but can also be created and modified imperatively when needed. It provides a clear,
 * structured format that aligns closely with development practices, making it easy to understand and utilize in generating type definitions
 * across various platforms.
 */
export type Schema = SchemaGeneric<AliasModel, DocumentModel>;

class SchemaImpl extends AbstractSchema<AliasModel, DocumentModel> implements Schema {
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

export function validateType(t: unknown, schema: Schema) {
  const { type } = schemaParsers(schema);
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
