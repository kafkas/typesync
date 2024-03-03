import type { Schema } from '../interfaces';

class SchemaImpl implements Schema {}

export function createSchema(): Schema {
  return new SchemaImpl();
}
