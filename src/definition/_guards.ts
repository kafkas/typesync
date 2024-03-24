import { assertNeverNoThrow } from '../util/assert.js';
import type { types } from './types/index.js';

export function isPrimitiveType(candidate: unknown): candidate is types.Primitive {
  const c = candidate as types.Primitive;
  switch (c) {
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'double':
    case 'timestamp':
      return true;
    default:
      assertNeverNoThrow(c);
      return false;
  }
}
