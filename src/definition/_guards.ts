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

export function isDiscriminatedUnionType(t: types.Type): t is types.DiscriminatedUnion {
  if (typeof t !== 'object' || t.type !== 'union') return false;
  return typeof (t as types.DiscriminatedUnion).discriminant === 'string';
}

export function isSimpleUnionType(t: types.Type): t is types.SimpleUnion {
  if (typeof t !== 'object' || t.type !== 'union') return false;
  return typeof (t as types.DiscriminatedUnion).discriminant === 'undefined';
}

export function isAliasType(t: types.Type): t is types.Alias {
  return !isPrimitiveType(t) && typeof t === 'string';
}
