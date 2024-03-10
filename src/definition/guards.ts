import type { types } from './types';

export function isPrimitiveType(candidate: unknown): candidate is types.Primitive {
  switch (candidate as types.Primitive) {
    case 'nil':
    case 'string':
    case 'boolean':
    case 'int':
    case 'timestamp':
      return true;
    default:
      return false;
  }
}
