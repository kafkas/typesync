import { ts } from '../../platforms/ts/index.js';
import { Schema } from '../../schema-new/index.js';

export function adjustSchemaForTS(prevSchema: Schema): ts.schema.Schema {
  // Currently no adjustment needed for TS
  return prevSchema;
}
