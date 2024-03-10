import { definition } from '../definition';
import { SchemaImpl } from './_impl/schema';
import type { Schema } from './_models';

export function createFromDefinition(def: definition.Definition): Schema {
  return new SchemaImpl(def);
}
