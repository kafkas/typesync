import { python } from '../../platforms/python';
import { schema } from '../../schema';

/**
 * Traverses a given schema and creates a new clone ensuring that all the schema types within it
 * are expressible. Converts inline map and enum definitions to alias models where necessary.
 *
 * @returns A new schema object.
 */
export function flattenSchema(s: schema.Schema): python.schema.ExpressibleSchema {
  // 1st pass (shallow traversal): add all models to the maps

  // 2nd pass (deep traversal): Create a schema tree, traverse it and mutate the nodes to create new alias models where necessary
  const clone = s.clone();

  // TODO: Implement

  return { models: [] };
}
