import type { schema as schemaNew } from '../schema-new/index.js';
import { assert } from './assert.js';

export function extractDiscriminantValueNew(
  union: schemaNew.types.DiscriminatedUnion,
  variant: schemaNew.types.Object
) {
  const discriminantField = variant.fields.find(field => field.name === union.discriminant);
  assert(
    discriminantField && discriminantField.type.type === 'string-literal',
    'Expected object to contain a discriminant field.'
  );
  return discriminantField.type.value;
}
