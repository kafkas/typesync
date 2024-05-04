import type { schema } from '../schema/index.js';

export interface GenerateRepresentationResult {
  /**
   * The internal representation of the schema parsed from the definition.
   */
  schema: schema.Schema;
}
