import type { types } from './types';

export function isPrimitiveValueType(t: types.Type): t is types.Primitive {
  switch (t.type) {
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
