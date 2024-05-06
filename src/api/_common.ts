import type { Schema } from '../schema/index.js';

export interface GenerateRepresentationResult {
  /**
   * The internal representation of the schema parsed from the definition.
   */
  schema: Schema;
}
