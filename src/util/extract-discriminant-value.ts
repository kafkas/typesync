import type { schema } from '../schema/index.js';
import { assert } from './assert.js';

export function extractDiscriminantValue(union: schema.types.DiscriminatedUnion, variant: schema.types.Object) {
  const discriminantField = variant.fields.find(field => field.name === union.discriminant);
  assert(
    discriminantField && discriminantField.type.type === 'string-literal',
    'Expected object to contain a discriminant field.'
  );
  return discriminantField.type.value;
}
