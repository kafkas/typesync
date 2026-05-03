import type { types } from '../types/index.js';

export interface AliasModel {
  model: 'alias';
  docs?: string;
  type: types.Type;
}

export interface DocumentModel {
  model: 'document';
  docs?: string;
  type: types.Object;
  path: string;
  swift?: SwiftDocumentModelOptions;
}

/**
 * Swift-specific overrides for a document model. Only consumed by the Swift
 * generator; ignored by every other generator.
 */
export interface SwiftDocumentModelOptions {
  /**
   * Configuration for the auto-generated `@DocumentID`-annotated property
   * that the Swift generator emits on every document model struct.
   */
  documentIdProperty?: {
    /**
     * The Swift property name for the auto-generated `@DocumentID` field.
     * Defaults to `id`.
     *
     * Set this to a non-`id` value (e.g. `documentId`) when the schema's
     * document body already has a field whose Firestore key is `id`, since
     * the Firebase iOS SDK refuses to decode a document where the
     * `@DocumentID` property name matches an existing body field's key.
     */
    name: string;
  };
}

export type Model = AliasModel | DocumentModel;

/**
 * Provides a raw representation of the user-defined database schema. A `Definition` object is created by parsing and aggregating the models
 * declared in schema definition files into a plain object keyed by model names.
 *
 * The `Definition` interface acts as the initial parsed version of the schema, directly reflecting the user inputs with minimal transformation.
 * It serves as the foundational data structure from which the more structured `Schema` object is derived.
 * */
export type Definition = Record<string, Model>;
