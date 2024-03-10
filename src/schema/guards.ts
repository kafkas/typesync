import type { Primitive, Type } from './types';

export function isPrimitiveValueType(t: Type): t is Primitive {
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
