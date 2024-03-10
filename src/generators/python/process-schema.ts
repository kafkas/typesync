import type { python } from '../../platforms/python';
import { schema } from '../../schema';
import { assertNever } from '../../util/assert';

/**
 * Traverses a given schema and creates a new clone ensuring that all the schema types within it
 * are expressible. Converts inline map and enum definitions to alias models where necessary.
 *
 * @returns A new schema object.
 */
export function processSchema(s: schema.Schema): python.ExpressibleSchema {
  // TODO: Deep clone the schema

  const aliasModelsByName = new Map<string, schema.AliasModel>();
  const documentModelsByName = new Map<string, schema.DocumentModel>();

  // 1st pass (shallow traversal): add all models to the maps
  s.models.forEach(model => {
    switch (model.type) {
      case 'alias':
        aliasModelsByName.set(model.name, model);
        break;
      case 'document':
        documentModelsByName.set(model.name, model);
        break;
      default:
        assertNever(model);
    }
  });

  // 2nd pass (deep traversal): create new alias models where necessary
  // TODO: Implement

  return { models: [] };
}