import { converters } from '../../converters/index.js';
import { definition } from '../../definition/index.js';
import { InvalidSchemaTypeError } from '../../errors/invalid-schema-type.js';
import { assertNever } from '../../util/assert.js';
import {
  AliasModel as AliasModelClass,
  CreateAliasModelParams,
  CreateDocumentModelParams,
  DocumentModel as DocumentModelClass,
  Schema as SchemaClass,
} from '../factory.js';
import { createZodSchemasForSchema } from './_zod-schemas.js';
import type * as types from './types.js';

export type AliasParameterType = types.Type;
export type DocumentParameterType = types.Object;

export class AliasModel extends AliasModelClass<AliasParameterType> {}
export class DocumentModel extends DocumentModelClass<DocumentParameterType> {}

export function createSchema() {
  return createSchemaWithModels([]);
}

/**
 * Creates a new Typesync schema from the specified definition.
 */
export function createSchemaFromDefinition(def: definition.Definition) {
  const models = Object.entries(def).map(([modelName, defModel]) => {
    switch (defModel.model) {
      case 'alias': {
        const schemaType = converters.definition.typeToSchema(defModel.type);
        return new AliasModel(modelName, defModel.docs ?? null, schemaType);
      }
      case 'document': {
        const schemaType = converters.definition.objectTypeToSchema(defModel.type);
        return new DocumentModel(modelName, defModel.docs ?? null, schemaType);
      }
      default:
        assertNever(defModel);
    }
  });
  return createSchemaWithModels(models);
}

export function createSchemaWithModels(models: (AliasModel | DocumentModel)[]) {
  const s = new Schema();
  s.addModelGroup(models);
  return s;
}

/**
 * Represents a structured model of a database schema. The `Schema` interface provides a higher-level, organized representation of the database
 * schema, facilitating easier manipulation and interaction with the Typesync generators.
 *
 * A `Schema` object is typically derived from a `Definition` but can also be created and modified imperatively when needed. It provides a clear,
 * structured format that aligns closely with development practices, making it easy to understand and utilize in generating type definitions
 * across various platforms.
 */

export class Schema extends SchemaClass<
  types.Type,
  AliasParameterType,
  DocumentParameterType,
  types.Object,
  types.DiscriminatedUnion
> {
  private zodSchemas = createZodSchemasForSchema(this);

  public override validateType(t: unknown) {
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

export function createAliasModel(params: CreateAliasModelParams<AliasParameterType>) {
  const { name, docs, value } = params;
  return new AliasModel(name, docs, value);
}

export function createDocumentModel(params: CreateDocumentModelParams<DocumentParameterType>) {
  const { name, docs, type } = params;
  return new DocumentModel(name, docs, type);
}
