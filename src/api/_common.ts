import type { Schema } from '../schema-new/index.js';

export interface GenerateRepresentationResult {
  /**
   * The internal representation of the schema parsed from the definition.
   */
  schema: Schema;
}
