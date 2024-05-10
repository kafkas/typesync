import { schema } from '../../schema/index.js';

export function adjustSchemaForTS(prevSchema: schema.Schema): schema.ts.Schema {
  // Currently no adjustment needed for TS
  return prevSchema;
}
