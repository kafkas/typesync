import { assertNeverNoThrow } from '../util/assert';
import type { types } from './types';

export function isPrimitiveType(candidate: unknown): candidate is types.Primitive {
  const c = candidate as types.Primitive;
  switch (c) {
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'timestamp':
      return true;
    default:
      assertNeverNoThrow(c);
      return false;
  }
}
