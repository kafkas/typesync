import { Schema, schema } from '../../schema/index.js';

export function adjustSchemaForTS(prevSchema: Schema): schema.ts.Schema {
  // Currently no adjustment needed for TS
  return prevSchema;
}
